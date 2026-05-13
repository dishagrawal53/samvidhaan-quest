const topicsData = require('../data/topicsData.json');
const User = require('../models/User');

const getAllTopics = async (req, res) => {
  try {
    const user = req.user;
    const completedTopics = user ? user.completedTopics : [];

    const enrichedTopics = topicsData.topics.map((topic) => ({
      ...topic,
      completed: completedTopics.includes(topic.id),
      locked: false,
    }));

    res.json({ topics: enrichedTopics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = topicsData.topics.find((t) => t.id === id);

    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    res.json({ topic });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
};

const markTopicComplete = async (req, res) => {
  try {
    const { topicId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user.completedTopics.includes(topicId)) {
      user.completedTopics.push(topicId);
      await user.addXP(50);
    }

    res.json({ message: 'Topic marked complete', xpEarned: 50 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark topic' });
  }
};

const getScenarios = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let scenarios = topicsData.scenarios || [];

    if (difficulty) {
      scenarios = scenarios.filter((s) => s.difficulty === difficulty);
    }

    const shuffled = scenarios.sort(() => Math.random() - 0.5).slice(0, 5);
    res.json({ scenarios: shuffled });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
};

const submitScenario = async (req, res) => {
  try {
    const { scenarioId, selectedArticle, selectedPrinciple } = req.body;
    const scenario = topicsData.scenarios.find((s) => s.id === scenarioId);

    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    const articleCorrect = scenario.correctArticle === selectedArticle;
    const principleCorrect = scenario.correctPrinciple === selectedPrinciple;
    const isCorrect = articleCorrect && principleCorrect;

    const xpEarned = isCorrect ? 75 : articleCorrect || principleCorrect ? 25 : 0;

    if (xpEarned > 0) {
      const user = await User.findById(req.user._id);
      await user.addXP(xpEarned);
    }

    res.json({
      isCorrect,
      articleCorrect,
      principleCorrect,
      xpEarned,
      explanation: scenario.explanation,
      correctArticle: scenario.correctArticle,
      correctPrinciple: scenario.correctPrinciple,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit scenario' });
  }
};

module.exports = {
  getAllTopics,
  getTopicById,
  markTopicComplete,
  getScenarios,
  submitScenario,
};
