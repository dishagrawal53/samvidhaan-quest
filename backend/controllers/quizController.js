const { Quiz, QuizResult } = require('../models/Quiz');
const User = require('../models/User');
const quizData = require('../data/quizData.json');

const getQuizzesByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const { difficulty } = req.query;

    const filter = { isActive: true };
    if (topic && topic !== 'all') filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;

    const quizzes = await Quiz.find(filter).select('-questions.options.isCorrect').sort({ createdAt: -1 });

    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const sanitizedQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options.map((o) => ({ _id: o._id, text: o.text })),
      difficulty: q.difficulty,
      topic: q.topic,
      xpReward: q.xpReward,
      articleRef: q.articleRef,
    }));

    res.json({
      quiz: {
        ...quiz.toObject(),
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

const getDailyChallenge = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daily = await Quiz.findOne({ isDaily: true, isActive: true });

    if (!daily) {
      const allQuizzes = await Quiz.find({ isActive: true });
      if (allQuizzes.length === 0) return res.status(404).json({ error: 'No quizzes available' });

      const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % allQuizzes.length;
      daily = allQuizzes[dayIndex];
    }

    const user = req.user;
    const alreadyCompleted = user.dailyChallengeCompletedAt &&
      new Date(user.dailyChallengeCompletedAt) >= today;

    const sanitizedQuestions = daily.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options.map((o) => ({ _id: o._id, text: o.text })),
      difficulty: q.difficulty,
      xpReward: q.xpReward,
      articleRef: q.articleRef,
    }));

    res.json({
      quiz: { ...daily.toObject(), questions: sanitizedQuestions },
      alreadyCompleted,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily challenge' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let correctCount = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      if (!question) return { ...answer, isCorrect: false };

      const selectedOpt = question.options[answer.selectedOption];
      const isCorrect = selectedOpt ? selectedOpt.isCorrect : false;
      if (isCorrect) correctCount++;

      return {
        questionId: question._id.toString(),
        selectedOption: answer.selectedOption,
        isCorrect,
        timeTaken: answer.timeTaken || 0,
        explanation: question.explanation,
        correctOptionIndex: question.options.findIndex((o) => o.isCorrect),
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const baseXP = quiz.xpReward;
    const xpEarned = Math.round(baseXP * (score / 100));

    const result = await QuizResult.create({
      user: userId,
      quiz: quizId,
      topic: quiz.topic,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      xpEarned,
      timeTaken,
      answers: gradedAnswers.map((a) => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
        timeTaken: a.timeTaken,
      })),
    });

    const user = await User.findById(userId);
    user.totalQuizzesPlayed += 1;
    user.correctAnswers += correctCount;
    user.totalAnswers += quiz.questions.length;

    if (!user.completedQuizzes.includes(quizId.toString())) {
      user.completedQuizzes.push(quizId.toString());
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (quiz.isDaily && (!user.dailyChallengeCompletedAt || new Date(user.dailyChallengeCompletedAt) < today)) {
      user.dailyChallengeCompletedAt = now;
    }

    const { xp, level, leveledUp } = await user.addXP(xpEarned);

    const newBadges = checkBadges(user);
    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
      await user.save();
    }

    quiz.playCount += 1;
    await quiz.save();

    res.json({
      result: {
        score,
        correctAnswers: correctCount,
        totalQuestions: quiz.questions.length,
        xpEarned,
        xp,
        level,
        leveledUp,
        gradedAnswers,
        newBadges,
      },
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

const getRandomQuestions = async (req, res) => {
  try {
    const { topic = 'all', difficulty, count = 10 } = req.query;

    const filter = { isActive: true };
    if (topic !== 'all') filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;

    const quizzes = await Quiz.find(filter);

    let allQuestions = [];
    quizzes.forEach((quiz) => {
      quiz.questions.forEach((q) => {
        allQuestions.push({
          ...q.toObject(),
          quizId: quiz._id,
          topic: quiz.topic,
        });
      });
    });

    const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, parseInt(count));

    const sanitized = shuffled.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options.map((o) => ({ _id: o._id, text: o.text })),
      difficulty: q.difficulty,
      topic: q.topic,
      xpReward: q.xpReward,
      articleRef: q.articleRef,
    }));

    res.json({ questions: sanitized });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

const checkBadges = (user) => {
  const newBadges = [];
  const existingIds = user.badges.map((b) => b.id);

  if (user.totalQuizzesPlayed >= 1 && !existingIds.includes('first_quiz')) {
    newBadges.push({ id: 'first_quiz', name: 'First Quiz!', description: 'Completed your first quiz', icon: '🎯' });
  }
  if (user.totalQuizzesPlayed >= 10 && !existingIds.includes('quiz_veteran')) {
    newBadges.push({ id: 'quiz_veteran', name: 'Quiz Veteran', description: 'Completed 10 quizzes', icon: '🏆' });
  }
  if (user.streak >= 7 && !existingIds.includes('week_streak')) {
    newBadges.push({ id: 'week_streak', name: '7-Day Streak!', description: 'Logged in 7 days in a row', icon: '🔥' });
  }
  if (user.accuracy >= 80 && user.totalAnswers >= 20 && !existingIds.includes('sharp_mind')) {
    newBadges.push({ id: 'sharp_mind', name: 'Sharp Mind', description: '80%+ accuracy on 20+ answers', icon: '🧠' });
  }
  if (user.level >= 5 && !existingIds.includes('advocate')) {
    newBadges.push({ id: 'advocate', name: 'Advocate', description: 'Reached level 5', icon: '⚖️' });
  }
  if (user.level >= 10 && !existingIds.includes('judge')) {
    newBadges.push({ id: 'judge', name: 'The Judge', description: 'Reached level 10', icon: '👨‍⚖️' });
  }

  return newBadges;
};

module.exports = {
  getQuizzesByTopic,
  getQuizById,
  getDailyChallenge,
  submitQuiz,
  getRandomQuestions,
};
