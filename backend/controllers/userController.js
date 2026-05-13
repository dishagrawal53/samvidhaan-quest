const User = require('../models/User');
const { QuizResult } = require('../models/Quiz');

const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const recentResults = await QuizResult.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('quiz', 'title topic');

    const topicBreakdown = {};
    const allResults = await QuizResult.find({ user: userId });
    allResults.forEach((r) => {
      if (r.topic) {
        if (!topicBreakdown[r.topic]) {
          topicBreakdown[r.topic] = { played: 0, correct: 0 };
        }
        topicBreakdown[r.topic].played += r.totalQuestions;
        topicBreakdown[r.topic].correct += r.correctAnswers;
      }
    });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        levelTitle: user.levelTitle,
        xpForNextLevel: user.xpForNextLevel,
        streak: user.streak,
        badges: user.badges,
        completedTopics: user.completedTopics,
        totalQuizzesPlayed: user.totalQuizzesPlayed,
        accuracy: user.accuracy,
        multiplayerWins: user.multiplayerWins,
      },
      recentResults,
      topicBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const updateXP = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid XP amount' });

    const user = await User.findById(req.user._id);
    const result = await user.addXP(amount);

    res.json({ ...result, reason });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update XP' });
  }
};

module.exports = { getUserStats, updateXP };
