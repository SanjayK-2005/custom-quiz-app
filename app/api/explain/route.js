import { NextResponse } from 'next/server';
import { generateExplanation } from '../../lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.question || typeof body.userAnswer !== 'number') {
      return NextResponse.json(
        { error: 'Question object and user answer are required' },
        { status: 400 }
      );
    }

    // Generate the explanation using Gemini
    const explanation = await generateExplanation(body.question, body.userAnswer);
    
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error generating explanation:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation. Please try again.' },
      { status: 500 }
    );
  }
} 