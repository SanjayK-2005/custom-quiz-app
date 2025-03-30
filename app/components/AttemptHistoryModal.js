'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Adjust import path if needed
import { Button } from "@/components/ui/button"; // Adjust import path

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export function AttemptHistoryModal({ quizId, quizTopic, isOpen, onClose }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch attempts only when the modal is open and quizId is valid
    if (isOpen && quizId) {
      const fetchAttempts = async () => {
        setLoading(true);
        setError('');
        setAttempts([]); // Clear previous attempts
        try {
          const response = await fetch(`/api/attempts?quizId=${quizId}`);
          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch attempts.');
          }
          setAttempts(data.attempts || []);
        } catch (err) {
          console.error(`Error fetching attempts for quiz ${quizId}:`, err);
          setError(err.message || 'Could not load attempt history.');
        } finally {
          setLoading(false);
        }
      };
      fetchAttempts();
    }
  }, [isOpen, quizId]); // Re-fetch if quizId or open state changes

  const viewAttemptDetails = (attemptId) => {
    router.push(`/quiz/summary/${attemptId}`);
    onClose(); // Close modal after navigating
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Attempt History: {quizTopic || 'Quiz'}</DialogTitle>
          <DialogDescription>
            Showing past attempts for this quiz. Click an attempt to view details.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto mt-4 space-y-3 pr-3">
          {loading && <p className="text-muted-foreground text-center">Loading attempts...</p>}
          {error && <p className="text-red-500 text-center">Error: {error}</p>}
          {!loading && !error && attempts.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No attempts found for this quiz.</p>
          )}
          {!loading && !error && attempts.length > 0 && (
            attempts.map((attempt) => (
              <div key={attempt._id} className="flex justify-between items-center bg-muted/50 p-3 rounded-md border">
                <div>
                  <p className="text-sm font-medium">
                    Score: {attempt.score?.toFixed(2)} / {attempt.maxScore?.toFixed(2)} ({attempt.percentage?.toFixed(1)}%)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Completed: {formatDate(attempt.completedAt)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => viewAttemptDetails(attempt._id)}>
                  View Details
                </Button>
              </div>
            ))
          )}
        </div>
         <div className="mt-4 text-right">
             <Button variant="ghost" onClick={onClose}>Close</Button>
         </div>
      </DialogContent>
    </Dialog>
  );
}