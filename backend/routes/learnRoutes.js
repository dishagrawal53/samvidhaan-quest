const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  getAllTopics,
  getTopicById,
  markTopicComplete,
  getScenarios,
  submitScenario,
} = require('../controllers/learnController');

router.get('/topics', optionalAuth, getAllTopics);
router.get('/topics/:id', optionalAuth, getTopicById);
router.post('/topics/:topicId/complete', authenticate, markTopicComplete);
router.get('/scenarios', optionalAuth, getScenarios);
router.post('/scenarios/submit', authenticate, submitScenario);

module.exports = router;
