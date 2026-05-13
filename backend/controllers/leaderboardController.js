const User = require('../models/User');

const getLeaderboard = async (req, res) => {
  try {
    const { type = 'xp', limit = 50 } = req.query;

    let sortField = {};
    if (type === 'xp') sortField = { xp: -1, level: -1 };
    else if (type === 'streak') sortField = { streak: -1 };
    else if (type === 'accuracy') sortField = { correctAnswers: -1 };
    else if (type === 'wins') sortField = { multiplayerWins: -1 };

    const users = await User.find({ isActive: true, isGuest: false })
      .select('username avatar xp level streak badges correctAnswers totalAnswers multiplayerWins levelTitle')
      .sort(sortField)
      .limit(parseInt(limit));

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      _id: u._id,
      username: u.username,
      avatar: u.avatar,
      xp: u.xp,
      level: u.level,
      levelTitle: u.levelTitle,
      streak: u.streak,
      badgeCount: u.badges.length,
      multiplayerWins: u.multiplayerWins,
      accuracy: u.totalAnswers > 0 ? Math.round((u.correctAnswers / u.totalAnswers) * 100) : 0,
    }));

    let userRank = null;
    if (req.user) {
      const userIndex = leaderboard.findIndex((u) => u._id.toString() === req.user._id.toString());
      if (userIndex >= 0) {
        userRank = userIndex + 1;
      } else {
        const count = await User.countDocuments({
          isActive: true,
          isGuest: false,
          xp: { $gt: req.user.xp },
        });
        userRank = count + 1;
      }
    }

    res.json({ leaderboard, userRank, type });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = { getLeaderboard };
