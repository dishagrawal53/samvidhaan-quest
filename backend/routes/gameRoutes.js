const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getBoardConfig, saveGameResult } = require('../controllers/gameController');

router.get('/board', getBoardConfig);
router.post('/result', authenticate, saveGameResult);

module.exports = router;
