import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quiz from '@/models/Quiz';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// Import necessary model(s)

export async function POST(request) {
  const session = await getServerSession(authOptions); 
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized: User not logged in or session invalid.' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    await dbConnect(); // Connect to the database

    const body = await request.json();
    const { config, questions } = body;

    // Basic validation
    if (!config || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid quiz data provided.' }, { status: 400 });
    }

    // Ensure numeric and boolean values are stored correctly
    const newQuizData = {
      userId: userId, // Associate quiz with the logged-in user
      config: {
        ...config,
        numberOfQuestions: Number(config.numberOfQuestions) || 0,
        marksPerQuestion: Number(config.marksPerQuestion) || 0,
        negativeMarking: !!config.negativeMarking,
        negativeMarksValue: (!!config.negativeMarking) ? (Number(config.negativeMarksValue) || 0) : 0,
        timerEnabled: !!config.timerEnabled,
        timeLimit: Number(config.timeLimit) || 0,
      },
      questions: questions.map(q => ({
        ...q,
        correctAnswer: Number(q.correctAnswer) // Ensure correctAnswer index is a number
      }))
      // TODO: Add userId if authentication is implemented
      // userId: session?.user?.id // Example if using NextAuth
    };

    const createdQuiz = await Quiz.create(newQuizData);

    return NextResponse.json({ success: true, quiz: createdQuiz }, { status: 201 });
  
  } catch (error) {
    console.error('Error creating quiz for user:', userId, error);
    if (error.name === 'ValidationError') {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error while creating quiz.' }, { status: 500 });
  }
}

// GET handler to retrieve multiple quizzes FOR THE LOGGED-IN USER
export async function GET(request) {
  const session = await getServerSession(authOptions); 
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const filter = { userId: userId }; // Filter by logged-in user

  try {
    await dbConnect();
    
    const quizzes = await Quiz.find(filter)
                              .select('_id config.topic config.numberOfQuestions createdAt') 
                              .sort({ createdAt: -1 }) 
                              .lean(); 

    return NextResponse.json({ success: true, quizzes });
  } catch (error) {
    console.error('Error fetching quizzes for user:', userId, error);
    return NextResponse.json({ success: false, error: 'Server error while fetching quizzes.' }, { status: 500 });
  }
}
