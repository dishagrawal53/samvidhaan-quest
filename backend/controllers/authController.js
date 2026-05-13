const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const user = await User.create({ username, email, password });

    const WELCOME_BADGE = {
      id: 'welcome',
      name: 'Welcome Citizen',
      description: 'Joined Samvidhan Quest',
      icon: '🇮🇳',
    };
    user.badges.push(WELCOME_BADGE);
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages[0] });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await user.updateStreak();

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const guestLogin = async (req, res) => {
  try {
    const guestNum = Math.floor(Math.random() * 100000);
    const user = await User.create({
      username: `Guest${guestNum}`,
      email: `guest${guestNum}@samvidhan.local`,
      password: `guest_${Date.now()}_${Math.random()}`,
      isGuest: true,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'Guest session created',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: 'Failed to create guest session' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const updates = {};

    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ error: 'Username taken' });
      updates.username = username;
    }
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ message: 'Profile updated', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  xp: user.xp,
  level: user.level,
  levelTitle: user.levelTitle,
  xpForNextLevel: user.xpForNextLevel,
  streak: user.streak,
  badges: user.badges,
  completedTopics: user.completedTopics,
  completedQuizzes: user.completedQuizzes,
  totalQuizzesPlayed: user.totalQuizzesPlayed,
  correctAnswers: user.correctAnswers,
  totalAnswers: user.totalAnswers,
  accuracy: user.accuracy,
  multiplayerWins: user.multiplayerWins,
  snakeLadderGamesPlayed: user.snakeLadderGamesPlayed,
  dailyChallengeCompletedAt: user.dailyChallengeCompletedAt,
  isGuest: user.isGuest,
  createdAt: user.createdAt,
});

module.exports = { signup, login, guestLogin, getMe, updateProfile };
