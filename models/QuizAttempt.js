import mongoose from 'mongoose';

const AttemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, // Make userId mandatory
    index: true // Add index for faster queries by user
  },
  answers: [{ type: Number, default: null }], // Array storing the index of the selected answer for each question, null if unanswered
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Prevent model overwrite during hot-reloading
export default mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', AttemptSchema);