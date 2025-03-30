import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  const session = await getServerSession(authOptions); 
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    await dbConnect();

    const body = await request.json();
    const { quizId, answers } = body;

    // --- Validation ---
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId) || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: 'Invalid data provided for attempt.' }, { status: 400 });
    }

    // --- Fetch the original Quiz to get config and questions for scoring ---
    const quiz = await Quiz.findById(quizId).lean(); // Use .lean() for plain JS object
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Original quiz not found.' }, { status: 404 });
    }

    if (answers.length !== quiz.questions.length) {
        return NextResponse.json({ success: false, error: 'Number of answers does not match number of questions.' }, { status: 400 });
    }

    // --- Calculate Score ---
    let calculatedScore = 0;
    const marksPerQ = Number(quiz.config.marksPerQuestion) || 0;
    const negMarks = Number(quiz.config.negativeMarksValue) || 0;
    const isNegativeMarkingEnabled = !!quiz.config.negativeMarking;

    quiz.questions.forEach((question, index) => {
      const userAnswerIndex = answers[index]; // This should be the index (0, 1, 2, 3) or null
      const correctAnswerIndex = question.correctAnswer; // Already stored as index

      if (userAnswerIndex !== null && userAnswerIndex !== '') { // Check if attempted
        if (userAnswerIndex === correctAnswerIndex) {
          calculatedScore += marksPerQ;
        } else if (isNegativeMarkingEnabled) {
          calculatedScore -= negMarks;
        }
      }
    });

    // Ensure score doesn't go below zero if that's a rule (optional)
    // calculatedScore = Math.max(0, calculatedScore); 

    const finalScore = Number(calculatedScore.toFixed(2));
    const maxScore = Number((quiz.questions.length * marksPerQ).toFixed(2));
    const percentage = maxScore > 0 ? Number(((finalScore / maxScore) * 100).toFixed(1)) : 0;

    // --- Save the Attempt ---
    const newAttemptData = {
      quizId: quiz._id,
      userId: userId, // Associate attempt with the logged-in user
      answers: answers, // Store the submitted answer indices
      score: finalScore,
      maxScore: maxScore,
      percentage: percentage,
      completedAt: new Date()
    };

    const createdAttempt = await QuizAttempt.create(newAttemptData);

    return NextResponse.json({ 
      success: true, 
      attemptId: createdAttempt._id,
      score: finalScore,
      maxScore: maxScore,
      percentage: percentage 
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving quiz attempt for user:', userId, error);
     if (error.name === 'ValidationError') {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error while saving attempt.' }, { status: 500 });
  }
}

// GET handler to retrieve multiple attempts
export async function GET(request) {
  const session = await getServerSession(authOptions); 
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get('quizId');

  const filter = {
    userId: userId // ALWAYS filter by logged-in user
  };
  
  if (quizId && mongoose.Types.ObjectId.isValid(quizId)) {
    filter.quizId = quizId; // Optionally filter by specific quiz
  } else if (quizId) {
    return NextResponse.json({ success: false, error: 'Invalid quizId format.' }, { status: 400 });
  }
  
  const projection = {
    quizId: 1,
    score: 1,
    maxScore: 1,
    percentage: 1,
    completedAt: 1,
    userId: 1, // Included userId in projection (optional)
  };

  try {
    await dbConnect();
    const attempts = await QuizAttempt.find(filter)
                                     .select(projection)
                                     .sort({ completedAt: -1 })
                                     .lean();

    return NextResponse.json({ success: true, attempts });
  } catch (error) {
    console.error(`Error fetching attempts for user ${userId}:`, error);
    return NextResponse.json({ success: false, error: 'Server error while fetching attempts.' }, { status: 500 });
  }
}
