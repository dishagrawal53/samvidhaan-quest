const Room = require('../models/Room');
const User = require('../models/User');
const { Quiz } = require('../models/Quiz');
const jwt = require('jsonwebtoken');

const activeRooms = new Map();

const setupSocketIO = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        socket.user = { _id: 'guest', username: 'Guest' };
        return next();
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('username avatar xp level');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (${socket.user?.username})`);

    socket.on('room:create', async ({ topic = 'mixed', difficulty = 'medium', maxPlayers = 4 }) => {
      try {
        const questions = await getRandomQuestionsForRoom(topic, difficulty, 10);

        const room = new Room({
          host: socket.user._id,
          topic,
          difficulty,
          maxPlayers,
          questions,
          players: [{
            userId: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar || '',
            socketId: socket.id,
            isReady: false,
          }],
        });

        room.generateCode();
        await room.save();

        activeRooms.set(room.code, {
          questionTimer: null,
          currentQuestionStart: null,
        });

        socket.join(room.code);
        socket.currentRoom = room.code;

        socket.emit('room:created', {
          code: room.code,
          room: sanitizeRoom(room),
        });
      } catch (err) {
        console.error('room:create error', err);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    socket.on('room:join', async ({ code }) => {
      try {
        const room = await Room.findOne({ code: code.toUpperCase() });
        if (!room) return socket.emit('error', { message: 'Room not found' });
        if (room.status !== 'waiting') return socket.emit('error', { message: 'Game already started' });
        if (room.players.length >= room.maxPlayers) return socket.emit('error', { message: 'Room is full' });

        const alreadyIn = room.players.find((p) => p.userId?.toString() === socket.user._id?.toString());
        if (!alreadyIn) {
          room.players.push({
            userId: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar || '',
            socketId: socket.id,
            isReady: false,
          });
          await room.save();
        }

        socket.join(code);
        socket.currentRoom = code;

        io.to(code).emit('room:updated', { room: sanitizeRoom(room) });
        socket.emit('room:joined', { code, room: sanitizeRoom(room) });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('room:ready', async () => {
      try {
        const code = socket.currentRoom;
        if (!code) return;
        const room = await Room.findOne({ code });
        if (!room) return;

        const player = room.players.find((p) => p.socketId === socket.id);
        if (player) {
          player.isReady = true;
          await room.save();
        }

        io.to(code).emit('room:updated', { room: sanitizeRoom(room) });

        const allReady = room.players.length >= 2 && room.players.every((p) => p.isReady);
        if (allReady) {
          startGame(io, room, code);
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to update ready state' });
      }
    });

    socket.on('quiz:answer', async ({ questionIndex, selectedOption, timeTaken }) => {
      try {
        const code = socket.currentRoom;
        if (!code) return;
        const room = await Room.findOne({ code });
        if (!room || room.status !== 'active') return;
        if (questionIndex !== room.currentQuestionIndex) return;

        const player = room.players.find((p) => p.socketId === socket.id);
        if (!player) return;

        const alreadyAnswered = player.answers.find((a) => a.questionIndex === questionIndex);
        if (alreadyAnswered) return;

        const question = room.questions[questionIndex];
        const isCorrect = question?.options?.[selectedOption]?.isCorrect || false;
        const score = isCorrect ? Math.max(100 - timeTaken * 2, 10) : 0;

        player.answers.push({ questionIndex, selectedOption, isCorrect, timeTaken });
        player.score += score;
        await room.save();

        socket.emit('quiz:answered', { isCorrect, score, correctOption: question?.options?.findIndex((o) => o.isCorrect) });
        io.to(code).emit('room:scores', { players: room.players.map((p) => ({ username: p.username, score: p.score })) });

        const allAnswered = room.players.every((p) => p.answers.find((a) => a.questionIndex === questionIndex));
        if (allAnswered) {
          const roomState = activeRooms.get(code);
          if (roomState?.questionTimer) {
            clearTimeout(roomState.questionTimer);
            roomState.questionTimer = null;
          }
          advanceQuestion(io, room, code);
        }
      } catch (err) {
        console.error('quiz:answer error', err);
      }
    });

    socket.on('room:leave', async () => {
      handleDisconnect(socket, io);
    });

    socket.on('disconnect', () => {
      handleDisconnect(socket, io);
    });
  });
};

const startGame = async (io, room, code) => {
  try {
    room.status = 'active';
    room.startedAt = new Date();
    room.currentQuestionIndex = 0;
    await room.save();

    io.to(code).emit('game:starting', { countdown: 3 });

    setTimeout(async () => {
      const sanitized = sanitizeRoomQuestion(room, 0);
      io.to(code).emit('game:question', { question: sanitized, questionIndex: 0, total: room.questions.length });
      startQuestionTimer(io, room, code);
    }, 3000);
  } catch (err) {
    console.error('startGame error', err);
  }
};

const startQuestionTimer = (io, room, code) => {
  const QUESTION_TIME = 30000;
  const roomState = activeRooms.get(code) || {};

  roomState.currentQuestionStart = Date.now();
  roomState.questionTimer = setTimeout(async () => {
    const freshRoom = await Room.findOne({ code });
    if (freshRoom && freshRoom.status === 'active') {
      advanceQuestion(io, freshRoom, code);
    }
  }, QUESTION_TIME);

  activeRooms.set(code, roomState);
};

const advanceQuestion = async (io, room, code) => {
  try {
    const nextIndex = room.currentQuestionIndex + 1;

    if (nextIndex >= room.questions.length) {
      await endGame(io, room, code);
      return;
    }

    room.currentQuestionIndex = nextIndex;
    await room.save();

    io.to(code).emit('game:question', {
      question: sanitizeRoomQuestion(room, nextIndex),
      questionIndex: nextIndex,
      total: room.questions.length,
    });

    startQuestionTimer(io, room, code);
  } catch (err) {
    console.error('advanceQuestion error', err);
  }
};

const endGame = async (io, room, code) => {
  try {
    room.status = 'finished';
    room.finishedAt = new Date();

    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    if (sorted.length > 0) {
      room.winner = sorted[0].userId;

      const winner = await User.findById(sorted[0].userId);
      if (winner) {
        winner.multiplayerWins += 1;
        await winner.addXP(200);
      }
    }

    for (let i = 1; i < sorted.length; i++) {
      const player = sorted[i];
      if (player.userId) {
        const user = await User.findById(player.userId);
        if (user) await user.addXP(50);
      }
    }

    await room.save();

    io.to(code).emit('game:ended', {
      results: sorted.map((p, i) => ({
        rank: i + 1,
        username: p.username,
        score: p.score,
        correctAnswers: p.answers.filter((a) => a.isCorrect).length,
      })),
    });

    activeRooms.delete(code);
  } catch (err) {
    console.error('endGame error', err);
  }
};

const handleDisconnect = async (socket, io) => {
  try {
    const code = socket.currentRoom;
    if (!code) return;

    const room = await Room.findOne({ code });
    if (!room) return;

    const playerIndex = room.players.findIndex((p) => p.socketId === socket.id);
    if (playerIndex >= 0) {
      room.players[playerIndex].isConnected = false;
      await room.save();
    }

    io.to(code).emit('player:disconnected', { username: socket.user?.username });
    socket.leave(code);
  } catch (err) {
    console.error('handleDisconnect error', err);
  }
};

const getRandomQuestionsForRoom = async (topic, difficulty, count) => {
  const filter = { isActive: true };
  if (topic !== 'mixed') filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;

  const quizzes = await Quiz.find(filter);
  let allQuestions = [];

  quizzes.forEach((quiz) => {
    quiz.questions.forEach((q) => {
      allQuestions.push(q.toObject());
    });
  });

  return allQuestions.sort(() => Math.random() - 0.5).slice(0, count);
};

const sanitizeRoom = (room) => ({
  code: room.code,
  status: room.status,
  topic: room.topic,
  difficulty: room.difficulty,
  maxPlayers: room.maxPlayers,
  questionCount: room.questions.length,
  players: room.players.map((p) => ({
    username: p.username,
    avatar: p.avatar,
    score: p.score,
    isReady: p.isReady,
    isConnected: p.isConnected,
  })),
});

const sanitizeRoomQuestion = (room, index) => {
  const q = room.questions[index];
  if (!q) return null;
  return {
    question: q.question,
    options: q.options.map((o) => ({ text: o.text })),
    timeLimit: 30,
    index,
    articleRef: q.articleRef,
  };
};

module.exports = setupSocketIO;
