const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { chat, explainArticle, searchArticles } = require('../controllers/chatController');

router.post('/', authenticate, chat);
router.get('/explain/:articleNumber', authenticate, explainArticle);
router.get('/search', authenticate, searchArticles);

module.exports = router;
