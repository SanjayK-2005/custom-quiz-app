import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY'; // Replace with your API key

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate a response from Gemini AI
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The response text from Gemini
 */
export async function generateContent(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    throw new Error('Failed to generate content from AI. Please try again later.');
  }
}

/**
 * Generate a quiz based on the provided configuration
 * @param {Object} config - Quiz configuration
 * @returns {Promise<Object>} - Generated quiz with questions and answers
 */
export async function generateQuiz(config) {
  const { topic, examContext, gradeLevel, difficulty, numQuestions } = config;
  
  const contextPrompt = examContext ? `for ${examContext}` : '';
  const prompt = `
    Generate a multiple-choice quiz about "${topic}" ${contextPrompt} at ${gradeLevel} level with ${difficulty} difficulty.
    Create exactly ${numQuestions} questions with 4 options each.
    
    Format the response as a JSON object with the following structure:
    {
      "questions": [
        {
          "id": "q1",
          "text": "Question text goes here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0, // Zero-based index of the correct option
          "explanation": "Detailed explanation of why this answer is correct"
        },
        // more questions...
      ]
    }
    
    Make sure:
    1. Questions are clear and focused on the topic
    2. All options are plausible, but only one is correct
    3. The correctAnswer index corresponds to the correct option
    4. Provide a thorough explanation for each answer
  `;

  try {
    const response = await generateContent(prompt);
    // Extract JSON from response (remove any non-JSON text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract valid JSON from AI response');
    }
    
    const quizData = JSON.parse(jsonMatch[0]);
    return {
      id: generateId(),
      topic,
      questions: quizData.questions,
      config
    };
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz. Please try again later.');
  }
}

/**
 * Generate an explanation for a quiz question answer
 * @param {Object} question - The question object
 * @param {number} userAnswer - The user's answer (index)
 * @returns {Promise<string>} - AI-generated explanation
 */
export async function generateExplanation(question, userAnswer) {
  const prompt = `
    Question: ${question.text}
    
    Options:
    ${question.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}
    
    Correct answer: ${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}
    
    User's answer: ${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}
    
    Please provide a detailed, educational explanation of why the correct answer is correct.
    If the user's answer is incorrect, explain why it's wrong and what makes the correct answer right.
    Include relevant facts, context, and make the explanation engaging and informative.
  `;

  try {
    return await generateContent(prompt);
  } catch (error) {
    console.error('Error generating explanation:', error);
    return 'Sorry, we couldn\'t generate an explanation at this time.';
  }
}

// Helper function to generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 