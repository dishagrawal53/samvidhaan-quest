const User = require('../models/User');
const boardConfig = require('../data/boardConfig.json');

const getBoardConfig = async (req, res) => {
  try {
    res.json({ board: boardConfig });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board config' });
  }
};

const saveGameResult = async (req, res) => {
  try {
    const { position, xpEarned, completed } = req.body;
    const user = await User.findById(req.user._id);

    user.snakeLadderGamesPlayed += 1;

    if (xpEarned > 0) {
      await user.addXP(xpEarned);
    } else {
      await user.save();
    }

    res.json({
      message: 'Game result saved',
      snakeLadderGamesPlayed: user.snakeLadderGamesPlayed,
      xpEarned,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save game result' });
  }
};

module.exports = { getBoardConfig, saveGameResult };
