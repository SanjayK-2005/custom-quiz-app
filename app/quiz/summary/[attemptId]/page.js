'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/app/components/Header'; // Assuming Header is in app/components
import Link from 'next/link'; // Import Link for Retake button

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId;

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) {
      setError('Attempt ID not found.');
      setLoading(false);
      return;
    }

    const fetchAttemptResults = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/attempts/${attemptId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch attempt results.');
        }
        setResultData(data.result);
      } catch (err) {
        console.error('Error fetching attempt results:', err);
        setError(err.message || 'Could not load quiz results.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptResults();
  }, [attemptId]);

  const handleRetakeQuiz = () => {
    if (resultData?.quizId) {
      // Navigate to the quiz page for the original quiz ID
      router.push(`/quiz/${resultData.quizId}`);
    } else {
      // Fallback or show error if quizId is missing
      console.error('Cannot retake quiz: Original Quiz ID is missing.');
      setError('Could not find original quiz data to retake.');
    }
  };


  // Render Loading/Error states
  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading results...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  if (!resultData) return <div className="flex justify-center items-center min-h-screen">Results not found.</div>;

  // Extract data for easier access
  const { score, maxScore, percentage, answers: userAnswers, quiz } = resultData;
  const { config, questions, topic } = quiz;
  const marksPerQuestion = Number(config?.marksPerQuestion) || 0;
  const isNegativeMarkingEnabled = !!config?.negativeMarking;
  const negativeMarksValue = isNegativeMarkingEnabled ? (Number(config?.negativeMarksValue) || 0) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Quiz Complete!</h1>

          {/* Score Overview */}
          <div className="text-center p-8 bg-muted rounded-lg mb-8">
            <div className="text-5xl font-bold mb-2">
              {Number(score).toFixed(2)} / {Number(maxScore).toFixed(2)}
            </div>
            <div className="text-xl text-muted-foreground">
              {Number(percentage).toFixed(1)}%
            </div>
          </div>

          {/* Quiz Details */}
          <div className="bg-card rounded-lg shadow p-6 mb-8">
             <h2 className="text-xl font-semibold mb-4 border-b pb-2">Quiz Details</h2>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Topic</span>
                  <span>{topic || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Difficulty</span>
                  <span>{config?.difficulty || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Questions Attempted</span>
                  <span>{userAnswers.filter(a => a !== null && a !== '').length} of {questions.length}</span>
                </div>
                {config?.timerEnabled && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Time Mode</span>
                    <span>{config?.timerType === 'per-question' ? 'Time Per Question' : 'Total Quiz Time'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Marks per Question</span>
                  <span>+{marksPerQuestion.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Negative Marking</span>
                    {isNegativeMarkingEnabled ? (
                       <span className="text-red-500">-{negativeMarksValue.toFixed(2)}</span>
                    ) : (
                       <span>Disabled</span>
                    )}
                  </div>
             </div>
          </div>


          {/* Question Review */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold">Question Review</h2>
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              const isAttempted = userAnswer !== null && userAnswer !== '';

              let points = 0;
              if (isAttempted) {
                if (isCorrect) {
                  points = marksPerQuestion;
                } else if (isNegativeMarkingEnabled) {
                  points = -negativeMarksValue;
                }
              }

              return (
                <div key={question._id || index} className="bg-card rounded-lg p-6 border">
                  <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                    <h3 className="font-medium text-lg">Question {index + 1}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isAttempted ? (
                        <>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isCorrect
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                          <span className={`font-semibold text-sm ${points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {points >= 0 ? `+${points.toFixed(2)}` : points.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Not Attempted
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-4 text-muted-foreground">{question.question}</p>

                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg text-sm border ${
                          optIndex === question.correctAnswer
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 font-semibold' // Highlight correct answer
                            : optIndex === userAnswer // Check if this was the user's incorrect answer
                            ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' // Highlight user's incorrect answer
                            : 'bg-muted/50 border-transparent' // Default style
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                         {optIndex === userAnswer && !isCorrect && <span className="text-red-600 font-semibold ml-2">(Your Answer)</span>}
                         {optIndex === question.correctAnswer && <span className="text-green-600 font-semibold ml-2">(Correct Answer)</span>}
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="bg-muted p-4 rounded-lg border mt-4">
                      <h4 className="font-medium mb-2 text-sm">Explanation:</h4>
                      <p className="text-muted-foreground text-sm">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

           {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
             <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Return to Dashboard
              </button>
               <button
                onClick={handleRetakeQuiz}
                className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
              >
                Retake Quiz
              </button>
          </div>

        </div>
      </main>
    </div>
  );
}