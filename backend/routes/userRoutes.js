const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getUserStats, updateXP } = require('../controllers/userController');

router.get('/stats', authenticate, getUserStats);
router.get('/stats/:id', authenticate, getUserStats);
router.post('/xp', authenticate, updateXP);

module.exports = router;
