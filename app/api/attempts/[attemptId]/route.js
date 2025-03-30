import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  const { attemptId } = params;

  if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId)) {
    return NextResponse.json({ success: false, error: 'Invalid Attempt ID provided.' }, { status: 400 });
  }

  try {
    await dbConnect();

    // Fetch the specific attempt
    const attempt = await QuizAttempt.findById(attemptId).lean();

    if (!attempt) {
      return NextResponse.json({ success: false, error: 'Quiz attempt not found.' }, { status: 404 });
    }

    // Fetch the original quiz data associated with this attempt
    const quiz = await Quiz.findById(attempt.quizId).lean();

    if (!quiz) {
      // This case might indicate data inconsistency
      console.error(`Inconsistency: Quiz ${attempt.quizId} not found for attempt ${attemptId}`);
      return NextResponse.json({ success: false, error: 'Original quiz data not found for this attempt.' }, { status: 404 });
    }

    // Combine attempt data with the original quiz questions/config for the summary page
    const resultData = {
      _id: attempt._id,
      quizId: attempt.quizId,
      userId: attempt.userId, // Include if available
      answers: attempt.answers,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      completedAt: attempt.completedAt,
      // Include original quiz info needed for display
      quiz: {
        _id: quiz._id,
        config: quiz.config,
        questions: quiz.questions, // Include questions and explanations
        topic: quiz.config.topic // Include topic directly for easier access
      }
    };

    return NextResponse.json({ success: true, result: resultData });

  } catch (error) {
    console.error(`Error fetching attempt ${attemptId}:`, error);
    return NextResponse.json({ success: false, error: 'Server error while fetching attempt details.' }, { status: 500 });
  }
}
