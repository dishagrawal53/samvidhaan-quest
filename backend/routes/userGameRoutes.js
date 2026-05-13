const express = require('express');
const userRouter = express.Router();
const gameRouter = express.Router();
const { authenticate } = require('../middleware/auth');
const { getUserStats, updateXP } = require('../controllers/userController');
const { getBoardConfig, saveGameResult } = require('../controllers/gameController');

userRouter.get('/stats', authenticate, getUserStats);
userRouter.get('/stats/:id', authenticate, getUserStats);
userRouter.post('/xp', authenticate, updateXP);

gameRouter.get('/board', getBoardConfig);
gameRouter.post('/result', authenticate, saveGameResult);

module.exports = { userRouter, gameRouter };
