const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  avatar: String,
  score: { type: Number, default: 0 },
  answers: [
    {
      questionIndex: Number,
      selectedOption: Number,
      isCorrect: Boolean,
      timeTaken: Number,
    },
  ],
  isReady: { type: Boolean, default: false },
  isConnected: { type: Boolean, default: true },
  socketId: String,
});

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    players: [playerSchema],
    topic: { type: String, default: 'mixed' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    maxPlayers: { type: Number, default: 4 },
    questionCount: { type: Number, default: 10 },
    questions: [mongoose.Schema.Types.Mixed],
    currentQuestionIndex: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['waiting', 'starting', 'active', 'reviewing', 'finished'],
      default: 'waiting',
    },
    startedAt: Date,
    finishedAt: Date,
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

roomSchema.methods.generateCode = function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.code = code;
  return code;
};

module.exports = mongoose.model('Room', roomSchema);
