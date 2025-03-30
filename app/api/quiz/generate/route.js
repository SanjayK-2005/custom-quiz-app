import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const config = await req.json();
    
    // Validate required fields
    if (!config.topic || !config.numberOfQuestions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: topic and numberOfQuestions' },
        { status: 400 }
      );
    }

    // Validate API key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const prompt = `Generate ${config.numberOfQuestions} multiple choice questions about ${config.topic} for ${config.gradeLevel || 'general'} level at ${config.difficulty || 'medium'} difficulty. 
    ${config.examContext ? `The context is: ${config.examContext}` : ''}
    
    Return ONLY a JSON array of questions. Each question must have this exact structure:
    {
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "explanation text"
    }
    
    Requirements:
    1. Each question must be clear and specific
    2. All four options must be distinct and relevant
    3. correctAnswer must be a number (0-3) indicating the index of the correct option
    4. The explanation must clearly justify why the correct answer is right
    
    DO NOT include any text before or after the JSON array. The response must start with '[' and end with ']'.`;

    // Make direct API call to Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Failed to generate questions: ${response.statusText}`);
    }

    const geminiResponse = await response.json();
    const rawText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error('Invalid Gemini response structure:', geminiResponse);
      throw new Error('Invalid response from Gemini API');
    }

    // Clean the response text to ensure it's valid JSON
    const cleanedText = rawText.trim()
      .replace(/^```json\s*/, '') // Remove leading ```json
      .replace(/\s*```$/, '')     // Remove trailing ```
      .replace(/\\n/g, ' ')       // Replace newlines with spaces
      .replace(/\s+/g, ' ');      // Normalize whitespace

    let questions;
    try {
      questions = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', cleanedText);
      throw new Error('Failed to generate valid quiz questions. Please try again.');
    }

    // Validate questions array
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format: empty or invalid questions array');
    }

    // Validate each question's structure
    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
          typeof q.correctAnswer !== 'number' || !q.explanation) {
        throw new Error(`Invalid question format at index ${index}`);
      }
    });

    // Save the quiz
    const headersList = headers();
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const host = headersList.get('host');
    const apiBaseUrl = `${protocol}://${host}`;

    const saveResponse = await fetch(`${apiBaseUrl}/api/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
      body: JSON.stringify({
        config: {
          ...config,
          userId: session.user.id
        },
        questions
      }),
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save quiz');
    }

    const savedQuizData = await saveResponse.json();

    if (!savedQuizData.success || !savedQuizData.quiz?._id) {
      throw new Error('Failed to get valid quiz ID after saving');
    }

    return NextResponse.json({ 
      success: true, 
      quizId: savedQuizData.quiz._id 
    });

  } catch (error) {
    console.error('[API_QUIZ_GENERATE_ERROR]', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate quiz. Please try again.' 
      },
      { status: error.status || 500 }
    );
  }
} 