const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const badgeSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  icon: String,
  earnedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    badges: [badgeSchema],
    completedTopics: [{ type: String }],
    completedQuizzes: [{ type: String }],
    totalQuizzesPlayed: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalAnswers: { type: Number, default: 0 },
    multiplayerWins: { type: Number, default: 0 },
    snakeLadderGamesPlayed: { type: Number, default: 0 },
    dailyChallengeCompletedAt: { type: Date },
    isGuest: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('levelTitle').get(function () {
  if (this.level >= 20) return 'Constitutional Expert';
  if (this.level >= 15) return 'Senior Advocate';
  if (this.level >= 10) return 'Judge';
  if (this.level >= 7) return 'Barrister';
  if (this.level >= 5) return 'Advocate';
  if (this.level >= 3) return 'Law Student';
  return 'Citizen';
});

userSchema.virtual('xpForNextLevel').get(function () {
  return this.level * 500;
});

userSchema.virtual('accuracy').get(function () {
  if (this.totalAnswers === 0) return 0;
  return Math.round((this.correctAnswers / this.totalAnswers) * 100);
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addXP = async function (amount) {
  this.xp += amount;
  const newLevel = Math.floor(this.xp / 500) + 1;
  const leveledUp = newLevel > this.level;
  this.level = newLevel;
  await this.save();
  return { xp: this.xp, level: this.level, leveledUp };
};

userSchema.methods.updateStreak = async function () {
  const now = new Date();
  const lastActive = this.lastActiveDate ? new Date(this.lastActiveDate) : null;

  if (lastActive) {
    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      this.streak += 1;
    } else if (diffDays > 1) {
      this.streak = 1;
    }
  } else {
    this.streak = 1;
  }

  this.lastActiveDate = now;
  await this.save();
  return this.streak;
};

module.exports = mongoose.model('User', userSchema);
