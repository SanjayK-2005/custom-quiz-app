import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quiz from '@/models/Quiz';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  const { quizId } = params;

  // Validate the quizId
  if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
    return NextResponse.json({ success: false, error: 'Invalid Quiz ID provided.' }, { status: 400 });
  }

  try {
    await dbConnect();

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found.' }, { status: 404 });
    }

    // We only need to return the necessary data for taking the quiz
    // Exclude potentially sensitive or large fields if necessary in the future
    return NextResponse.json({ 
      success: true, 
      quiz: { 
        _id: quiz._id,
        config: quiz.config,
        questions: quiz.questions
        // Do not return userId here unless specifically needed and secured
      } 
    });

  } catch (error) {
    console.error(`Error fetching quiz ${quizId}:`, error);
    return NextResponse.json({ success: false, error: 'Server error while fetching quiz.' }, { status: 500 });
  }
}

// Optional: Add PUT/PATCH for updating a quiz (if needed later)

// Optional: Add DELETE for removing a quiz (if needed later)
