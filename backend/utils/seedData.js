require('dotenv').config();
const mongoose = require('mongoose');
const { Quiz } = require('../models/Quiz');
const quizData = require('../data/quizData.json');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');

    const quizzes = quizData.quizzes.map((q) => ({
      title: q.title,
      topic: q.topic,
      difficulty: q.difficulty,
      xpReward: q.xpReward || 100,
      isDaily: q.isDaily || false,
      isActive: true,
      questions: q.questions,
    }));

    await Quiz.insertMany(quizzes);
    console.log(`✅ Seeded ${quizzes.length} quizzes`);

    const count = await Quiz.countDocuments();
    console.log(`Total quizzes in DB: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
