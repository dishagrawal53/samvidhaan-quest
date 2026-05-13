const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  explanation: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  topic: { type: String, required: true },
  articleRef: { type: String },
  xpReward: { type: Number, default: 10 },
  tags: [String],
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    topic: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: [quizQuestionSchema],
    timeLimit: { type: Number, default: 30 },
    xpReward: { type: Number, default: 100 },
    isDaily: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    playCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const quizResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    topic: { type: String },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    xpEarned: { type: Number, default: 0 },
    timeTaken: { type: Number },
    answers: [
      {
        questionId: String,
        selectedOption: Number,
        isCorrect: Boolean,
        timeTaken: Number,
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = { Quiz, QuizResult };
