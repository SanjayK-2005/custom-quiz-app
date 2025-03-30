'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/app/components/Header';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId;

  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [questionStatuses, setQuestionStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch quiz data.');
        }
        
        const fetchedQuiz = data.quiz;
        setQuizData(fetchedQuiz);
        setAnswers(new Array(fetchedQuiz.questions.length).fill(null));
        setQuestionStatuses(new Array(fetchedQuiz.questions.length).fill('unseen'));
        setScore(0);

        if (fetchedQuiz.config.timerEnabled) {
          const timeLimitValue = Number(fetchedQuiz.config.timeLimit) || 0;
          const timeLimit = fetchedQuiz.config.timerType === 'per-question'
            ? timeLimitValue
            : timeLimitValue * 60;
          setTimeLeft(timeLimit);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message || 'Could not load the quiz.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!timeLeft || !quizData?.config.timerEnabled || loading) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizData, loading]);

  useEffect(() => {
    if (selectedAnswer !== null && selectedAnswer !== '' && currentQuestionIndex < questionStatuses.length && questionStatuses[currentQuestionIndex] !== 'answered') {
      const newStatuses = [...questionStatuses];
      newStatuses[currentQuestionIndex] = 'answered';
      setQuestionStatuses(newStatuses);
    }
  }, [selectedAnswer, currentQuestionIndex, questionStatuses]);

  useEffect(() => {
    if (quizData && currentQuestionIndex < questionStatuses.length && questionStatuses[currentQuestionIndex] === 'unseen') {
        const newStatuses = [...questionStatuses];
        newStatuses[currentQuestionIndex] = 'seen';
        setQuestionStatuses(newStatuses);
    }
  }, [currentQuestionIndex, quizData, questionStatuses]);

  const handleTimeUp = () => {
    if (!quizData) return;
    console.log('Time is up for the current question or quiz!');
    
    if (quizData.config.timerType === 'total') {
       console.log('Total quiz time up, submitting attempt...');
       handleQuizComplete(); 
    } else if (quizData.config.timerType === 'per-question') {
       console.log('Per-question time up, moving to next question...');
       handleNextQuestion();
    }
  };

  const handleAnswerSelect = (index) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);
  };

  const updateScore = (answerIndex, currentQ) => {
    if (!quizData || !quizData.config || !currentQ) return;
    
    const isCorrect = answerIndex === currentQ.correctAnswer;
    const marksPerQuestion = Number(quizData.config.marksPerQuestion) || 0;
    const negativeMarksValue = Number(quizData.config.negativeMarksValue) || 0;
    const isNegativeMarkingEnabled = !!quizData.config.negativeMarking;
    let points = 0;

    if (isCorrect) {
      points = marksPerQuestion;
    } else if (isNegativeMarkingEnabled && answerIndex !== null && answerIndex !== '') {
      points = -negativeMarksValue;
    } 

    setScore(prev => {
      const currentScore = Number(prev) || 0;
      const newScore = currentScore + points;
      return Number(newScore.toFixed(2)); 
    });
  };

  const handleNextQuestion = () => {
    if (!quizData) return;

    if (quizData.config.feedbackStyle === 'end' && (selectedAnswer === null || selectedAnswer === '')) {
      const newStatuses = [...questionStatuses];
      if (currentQuestionIndex < newStatuses.length && newStatuses[currentQuestionIndex] !== 'answered') {
         newStatuses[currentQuestionIndex] = 'skipped';
         setQuestionStatuses(newStatuses);
      }
    }

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null); 
      setShowExplanation(false);

      if (quizData.config.timerEnabled && quizData.config.timerType === 'per-question') {
        setTimeLeft(Number(quizData.config.timeLimit) || 60);
      }
    } else {
      handleQuizComplete();
    }
  };

  const submitQuizAttempt = async () => {
    if (!quizId || !answers) return; 
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, answers }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit quiz attempt.');
      }

      const attemptId = result.attemptId;
      if (!attemptId) {
        throw new Error('Attempt ID not returned from server.');
      }

      router.push(`/quiz/summary/${attemptId}`);

    } catch (err) {
      console.error('Error submitting quiz attempt:', err);
      setError(err.message || 'Could not submit your answers. Please try again.');
      setLoading(false);
    }
  };
  
  const handleQuizComplete = () => {
    console.log("Quiz complete, submitting attempt...");
    submitQuizAttempt();
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading quiz...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  if (!quizData) return <div className="flex justify-center items-center min-h-screen">Quiz not found.</div>;

  const currentQuestion = quizData.questions[currentQuestionIndex];
  if (!currentQuestion) {
     console.error("Current question is undefined at index:", currentQuestionIndex);
     return <div className="flex justify-center items-center min-h-screen text-red-500">Error loading question data.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{quizData.config?.topic || 'Quiz'}</h1>
              {quizData.config.timerEnabled && timeLeft !== null && (
                <div className="text-lg font-medium">
                  Time left: <span className={timeLeft < 60 ? 'text-red-500' : ''}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-10 gap-1 mb-6">
              {(questionStatuses || []).map((status, index) => (
                <div
                  key={`status-${index}`}
                  className={`h-2 rounded-full ${ 
                    index === currentQuestionIndex ? 'bg-primary' : 
                    status === 'answered' ? 'bg-green-500' : 
                    status === 'skipped' ? 'bg-yellow-500' : 
                    status === 'seen' ? 'bg-gray-500' : 
                    'bg-secondary' 
                  }`}
                  title={`Question ${index + 1}: ${status}`}
                ></div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                {quizData.config.feedbackStyle === 'immediate' && <span>Score: {score}</span>}
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">{currentQuestion.question}</h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={(quizData.config.feedbackStyle === 'immediate' && showExplanation) || loading}
                    className={`w-full text-left p-3 rounded-md border border-input transition-colors 
                      ${selectedAnswer === index ? 'border-primary bg-primary/10' : 'hover:bg-secondary'}
                      ${quizData.config.feedbackStyle === 'immediate' && showExplanation && index === currentQuestion.correctAnswer ? 'border-green-500 bg-green-100 dark:bg-green-900/30' : ''}
                      ${quizData.config.feedbackStyle === 'immediate' && showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer ? 'border-red-500 bg-red-100 dark:bg-red-900/30' : ''}
                    `}
                  >
                    <div className="flex items-start">
                      <span className="w-6 inline-block">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {quizData.config.feedbackStyle === 'immediate' && showExplanation && currentQuestion.explanation && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-medium mb-2">Explanation:</h3>
                  <div className="text-sm whitespace-pre-line">{currentQuestion.explanation}</div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                {quizData.config.feedbackStyle === 'immediate' ? (
                  showExplanation ? (
                    <button
                      onClick={handleNextQuestion}
                      disabled={loading}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50"
                    >
                      {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (selectedAnswer !== null && selectedAnswer !== '') {
                          setShowExplanation(true);
                          updateScore(selectedAnswer, currentQuestion);
                        }
                      }}
                      disabled={selectedAnswer === null || selectedAnswer === '' || loading}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      handleNextQuestion();
                    }}
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                )}
              </div>
              {error && <div className="text-red-500 text-sm mt-2 text-right">{error}</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 