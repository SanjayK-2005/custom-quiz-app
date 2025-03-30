'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../components/Header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AttemptHistoryModal } from '../components/AttemptHistoryModal';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric' 
  });
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorCreate, setErrorCreate] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorHistory, setErrorHistory] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedQuizForHistory, setSelectedQuizForHistory] = useState(null);

  const [formData, setFormData] = useState({
    topic: '',
    examContext: '',
    gradeLevel: '',
    difficulty: 'medium',
    numberOfQuestions: 5,
    marksPerQuestion: 1,
    negativeMarking: false,
    negativeMarksValue: 0.25,
    timerEnabled: false,
    timerType: 'total',
    timeLimit: 10,
    feedbackStyle: 'end',
    timerTypeForm: 'Total Quiz Time',
    feedbackStyleForm: 'At End of Quiz Only'
  });

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch('/api/quizzes');
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      } catch (err) {
        setErrorHistory(err.message);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (session?.user?.id) {
      fetchQuizzes();
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let updatedValue = type === 'checkbox' ? checked : value;
    let fieldName = name;

    if (['numberOfQuestions', 'marksPerQuestion', 'negativeMarksValue', 'timeLimit'].includes(name)) {
      updatedValue = Number(value) || 0;
    }
    if (name === 'feedbackStyleForm') {
        fieldName = 'feedbackStyle';
        updatedValue = value === 'Immediately (After Each Question)' ? 'immediate' : 'end';
    }
    if (name === 'timerTypeForm') {
        fieldName = 'timerType';
        updatedValue = value === 'Time Per Question' ? 'per-question' : 'total';
    }
    if (name === 'negativeMarks') {
        fieldName = 'negativeMarksValue';
        updatedValue = Number(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: updatedValue,
      ...(fieldName === 'feedbackStyle' && { feedbackStyleForm: value }),
      ...(fieldName === 'timerType' && { timerTypeForm: value })
    }));
  };

  const handleCreateQuizSubmit = async (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    setErrorCreate('');

    const payload = {
      topic: formData.topic,
      examContext: formData.examContext,
      gradeLevel: formData.gradeLevel,
      difficulty: formData.difficulty,
      numberOfQuestions: Number(formData.numberOfQuestions),
      marksPerQuestion: Number(formData.marksPerQuestion),
      negativeMarking: !!formData.negativeMarking,
      negativeMarksValue: formData.negativeMarking ? (Number(formData.negativeMarksValue) || 0) : 0,
      timerEnabled: !!formData.timerEnabled,
      timerType: formData.timerEnabled ? formData.timerType : undefined,
      timeLimit: formData.timerEnabled ? (Number(formData.timeLimit) || 0) : undefined,
      feedbackStyle: formData.feedbackStyle,
    };

    console.log("Sending payload:", payload);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate quiz');
      }
      const quizId = result.quizId;
      if (!quizId) {
        throw new Error('Quiz ID not returned from server.');
      }
      setIsCreateDialogOpen(false);
      router.push(`/quiz/${quizId}`);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setErrorCreate(err.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleViewHistory = (quiz) => {
    setSelectedQuizForHistory({ id: quiz._id, topic: quiz.config?.topic });
    setIsHistoryModalOpen(true);
  };

  if (status === 'loading' || loadingHistory) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
             <h1 className="text-3xl font-bold">Dashboard</h1>
             <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                    <Button>Create New Quiz</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Quiz</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to generate your custom quiz.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[80vh] overflow-y-auto p-1 pr-3">
                    {errorCreate && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                          {errorCreate}
                        </div>
                      )}
                     <form onSubmit={handleCreateQuizSubmit} className="space-y-6 mt-4">
                        <div className="space-y-4 border-b pb-4">
                           <h3 className="text-lg font-semibold">Content</h3>
                           <div className="space-y-2">
                            <label htmlFor="topic" className="text-xs font-medium text-muted-foreground">Topic *</label>
                            <input id="topic" name="topic" value={formData.topic} onChange={handleInputChange} className="w-full rounded-md border bg-background border-input p-2 text-sm" placeholder="e.g., JavaScript Fundamentals" required />
                          </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                <label htmlFor="examContext" className="text-xs font-medium text-muted-foreground">Exam Context</label>
                                <input id="examContext" name="examContext" value={formData.examContext} onChange={handleInputChange} className="w-full rounded-md border bg-background border-input p-2 text-sm" placeholder="Optional"/>
                              </div>
                               <div className="space-y-2">
                                <label htmlFor="gradeLevel" className="text-xs font-medium text-muted-foreground">Grade/Level</label>
                                <input id="gradeLevel" name="gradeLevel" value={formData.gradeLevel} onChange={handleInputChange} className="w-full rounded-md border bg-background border-input p-2 text-sm" placeholder="e.g., College B.Tech" required/>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 border-b pb-4">
                           <h3 className="text-lg font-semibold">Structure</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor="difficulty" className="text-xs font-medium text-muted-foreground">Difficulty</label>
                                <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="w-full rounded-md border bg-background border-input p-2 text-sm">
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="numberOfQuestions" className="text-xs font-medium text-muted-foreground">No. Questions</label>
                                <input id="numberOfQuestions" name="numberOfQuestions" type="number" value={formData.numberOfQuestions} onChange={handleInputChange} className="w-full rounded-md border bg-background border-input p-2 text-sm" min="1" max="20" required />
                              </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4 border-b pb-4">
                           <h3 className="text-lg font-semibold">Scoring</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="marksPerQuestion" className="text-xs font-medium text-muted-foreground">Marks / Q</label>
                                    <input id="marksPerQuestion" name="marksPerQuestion" type="number" value={formData.marksPerQuestion} onChange={handleInputChange} className="w-full rounded-md border bg-background border-input p-2 text-sm" min="0.5" step="0.5" required />
                                </div>
                                <div className="space-y-2">
                                   <div className="flex items-center space-x-2 pt-5"> 
                                      <input id="negativeMarking" name="negativeMarking" type="checkbox" checked={formData.negativeMarking} onChange={handleInputChange} className="rounded border-gray-300" />
                                      <label htmlFor="negativeMarking" className="text-sm font-medium">Negative Marks?</label>
                                    </div>
                                 </div>
                            </div>
                            {formData.negativeMarking && (
                                 <div className="space-y-2 pt-2">
                                    <label htmlFor="negativeMarksValue" className="text-xs font-medium text-muted-foreground">Negative Marks Value</label>
                                    <input id="negativeMarksValue" name="negativeMarksValue" type="number" value={formData.negativeMarksValue} onChange={handleInputChange} className="w-full rounded-md border bg-background border-input p-2 text-sm" min="0" step="0.25" max={formData.marksPerQuestion} required />
                                </div>
                             )}
                        </div>

                        <div className="space-y-4 border-b pb-4">
                            <h3 className="text-lg font-semibold">Timing</h3>
                             <div className="flex items-center space-x-2">
                                <input id="timerEnabled" name="timerEnabled" type="checkbox" checked={formData.timerEnabled} onChange={handleInputChange} className="rounded border-gray-300" />
                                <label htmlFor="timerEnabled" className="text-sm font-medium">Enable Timer?</label>
                            </div>
                             {formData.timerEnabled && (
                                <div className="space-y-4 pt-2">
                                   <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Timer Type</label>
                                     <div className="flex gap-4">
                                        <label className="flex items-center space-x-2"><input type="radio" name="timerTypeForm" value="Total Quiz Time" checked={formData.timerTypeForm === 'Total Quiz Time'} onChange={handleInputChange} className="rounded-full" /><span className="text-sm">Total Quiz</span></label>
                                        <label className="flex items-center space-x-2"><input type="radio" name="timerTypeForm" value="Time Per Question" checked={formData.timerTypeForm === 'Time Per Question'} onChange={handleInputChange} className="rounded-full" /><span className="text-sm">Per Question</span></label>
                                     </div>
                                   </div>
                                   <div className="space-y-2">
                                    <label htmlFor="timeLimit" className="text-xs font-medium text-muted-foreground">{formData.timerTypeForm === 'Total Quiz Time' ? 'Total Time (minutes)' : 'Time Per Q (seconds)'}</label>
                                    <input id="timeLimit" name="timeLimit" type="number" value={formData.timeLimit} onChange={handleInputChange} className="w-full rounded-md border bg-background border-input p-2 text-sm" min="1" max={formData.timerTypeForm === 'Total Quiz Time' ? 120 : 300} required />
                                   </div>
                                </div>
                             )}
                        </div>

                        <div className="space-y-4">
                           <h3 className="text-lg font-semibold">Feedback Style</h3>
                           <div className="space-y-2">
                             <label className="text-xs font-medium text-muted-foreground">Show Feedback</label>
                               <div className="flex gap-4">
                                   <label className="flex items-center space-x-2"><input type="radio" name="feedbackStyleForm" value="Immediately (After Each Question)" checked={formData.feedbackStyleForm === 'Immediately (After Each Question)'} onChange={handleInputChange} className="rounded-full" /><span className="text-sm">Immediate</span></label>
                                   <label className="flex items-center space-x-2"><input type="radio" name="feedbackStyleForm" value="At End of Quiz Only" checked={formData.feedbackStyleForm === 'At End of Quiz Only'} onChange={handleInputChange} className="rounded-full" /><span className="text-sm">At End</span></label>
                               </div>
                            </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={loadingCreate}
                          className="w-full mt-6"
                        >
                          {loadingCreate ? 'Creating Quiz...' : 'Create Quiz'}
                        </Button>
                     </form>
                  </div>
                </DialogContent>
             </Dialog>
          </div>
          
          <div className="space-y-6">
             <h2 className="text-2xl font-semibold border-b pb-2">Quiz History</h2>
             {loadingHistory && <p className="text-muted-foreground">Loading history...</p>}
             {errorHistory && <p className="text-red-500">Error: {errorHistory}</p>}
             {!loadingHistory && !errorHistory && quizzes.length === 0 && (
                <div className="text-center py-10 border rounded-lg bg-card">
                    <p className="text-muted-foreground">You haven't created any quizzes yet.</p>
                    <Button variant="link" className="mt-2" onClick={() => setIsCreateDialogOpen(true)}>
                         Create one now
                    </Button>
                </div>
             )}
             {!loadingHistory && !errorHistory && quizzes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizzes.map((quiz) => (
                      <div key={quiz._id} className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-base sm:text-lg break-words">{quiz.config?.topic || 'Untitled Quiz'}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                             {quiz.config?.numberOfQuestions || 'N/A'} Questions | Created: {formatDate(quiz.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => handleViewHistory(quiz)}
                           >
                             View History
                           </Button>
                           <Link href={`/quiz/${quiz._id}`} legacyBehavior>
                             <a className="px-3 py-1.5 text-xs sm:text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors whitespace-nowrap">
                                Start Quiz
                             </a>
                           </Link>
                        </div>
                      </div>
                    ))}
                </div>
             )}
          </div>
        </div> 
      </main>

      {selectedQuizForHistory && (
        <AttemptHistoryModal 
            quizId={selectedQuizForHistory.id}
            quizTopic={selectedQuizForHistory.topic}
            isOpen={isHistoryModalOpen}
            onClose={() => {
                setIsHistoryModalOpen(false);
                setSelectedQuizForHistory(null);
            }}
        />
      )}

    </div>
  );
} 