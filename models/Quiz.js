import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of the correct option
  explanation: { type: String, required: false },
});

const QuizConfigSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  examContext: { type: String, required: false },
  gradeLevel: { type: String, required: false },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  numberOfQuestions: { type: Number, required: true },
  marksPerQuestion: { type: Number, required: true, default: 1 },
  negativeMarking: { type: Boolean, required: true, default: false },
  negativeMarksValue: { type: Number, required: false, default: 0 }, // Only relevant if negativeMarking is true
  timerEnabled: { type: Boolean, required: true, default: false },
  timerType: { type: String, enum: ['total', 'per-question'], required: false }, // 'total' or 'per-question'
  timeLimit: { type: Number, required: false, default: 10 }, // Minutes for total, seconds for per-question
  feedbackStyle: { type: String, enum: ['immediate', 'end'], required: true, default: 'end' } // 'immediate' or 'end'
});

const QuizSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, // Make userId mandatory 
    index: true // Add index for faster queries by user
  },
  config: { type: QuizConfigSchema, required: true },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

// Prevent model overwrite during hot-reloading
export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);