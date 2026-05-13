const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  getQuizzesByTopic,
  getQuizById,
  getDailyChallenge,
  submitQuiz,
  getRandomQuestions,
} = require('../controllers/quizController');

router.get('/daily', authenticate, getDailyChallenge);
router.get('/random', optionalAuth, getRandomQuestions);
router.get('/topic/:topic', optionalAuth, getQuizzesByTopic);
router.get('/:id', optionalAuth, getQuizById);
router.post('/submit', authenticate, submitQuiz);

module.exports = router;
