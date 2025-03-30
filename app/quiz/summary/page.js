'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizSummary() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    // Get results and quiz data from localStorage
    const storedResults = localStorage.getItem('quizResults');
    const storedQuiz = localStorage.getItem('currentQuiz');

    if (!storedResults || !storedQuiz) {
      router.push('/dashboard');
      return;
    }

    setResults(JSON.parse(storedResults));
    setQuizData(JSON.parse(storedQuiz));
  }, []);

  const handleReturnToDashboard = () => {
    // Clear quiz data from localStorage
    localStorage.removeItem('quizResults');
    localStorage.removeItem('currentQuiz');
    router.push('/dashboard');
  };

  if (!results || !quizData) return <div className="p-8">Loading results...</div>;

  const percentage = (results.score / results.maxScore) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Quiz Complete!</h1>

          {/* Score Overview */}
          <div className="text-center p-8 bg-muted rounded-lg mb-8">
            <div className="text-5xl font-bold mb-2">
              {Number(results.score).toFixed(2)}/{Number(results.maxScore).toFixed(2)}
            </div>
            <div className="text-xl text-muted-foreground">
              {((Number(results.score) / Number(results.maxScore)) * 100).toFixed(1)}%
            </div>
          </div>

          {/* Quiz Details */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Topic</span>
              <span>{quizData.topic}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Difficulty</span>
              <span>{quizData.config.difficulty}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Questions Attempted</span>
              <span>{results.answers.filter(a => a !== null && a !== '').length} of {results.totalQuestions}</span>
            </div>
            {quizData.config.timerEnabled && (
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Time Mode</span>
                <span>{quizData.config.timerType}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Marks per Question</span>
              <span>+{Number(quizData.config.marksPerQuestion).toFixed(2)}</span>
            </div>
            {quizData.config.negativeMarking ? (
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Negative Marking</span>
                <span>-{Number(quizData.config.negativeMarksValue).toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Negative Marking</span>
                <span>Disabled</span>
              </div>
            )}
          </div>

          {/* Question Review */}
          <div className="space-y-8 mb-8">
            <h2 className="text-2xl font-semibold">Question Review</h2>
            {results.questions.map((question, index) => {
              const userAnswer = results.answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              // Safely get numeric config values from results
              const marksPerQuestion = Number(results.config?.marksPerQuestion) || 0;
              const isNegativeMarkingEnabled = !!results.config?.negativeMarking;
              const negativeMarksValue = isNegativeMarkingEnabled ? (Number(results.config?.negativeMarksValue) || 0) : 0;
              
              let points = 0;
              const isAttempted = userAnswer !== null && userAnswer !== '';

              if (isAttempted) {
                if (isCorrect) {
                  points = marksPerQuestion;
                } else if (isNegativeMarkingEnabled) {
                  // Apply negative marks only if enabled and question was attempted incorrectly
                  points = -negativeMarksValue;
                }
                // If incorrect and negative marking is disabled, points remain 0
              }
              // If not attempted, points remain 0

              return (
                <div key={index} className="bg-background rounded-lg p-6 border">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Question {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      {isAttempted ? (
                        <>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            isCorrect 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                          <span className={`font-medium ${points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {/* Display points correctly */}
                            {points > 0 ? `+${points.toFixed(2)}` : points.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Not Attempted
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-4">{question.question}</p>

                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg ${
                          optIndex === question.correctAnswer
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : optIndex === userAnswer && !isCorrect
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-muted'
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Explanation:</h4>
                      <p className="text-muted-foreground">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Return Button */}
          <button
            onClick={handleReturnToDashboard}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 