const OpenAI = require('openai');
const Article = require('../models/Article');

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://samvidhan-quest.app',
    'X-Title': 'Samvidhan Quest',
  },
});

// ─── RAG: Retrieve relevant chunks from MongoDB ────────────────────────────────
const retrieveRelevantChunks = async (query, topK = 5) => {
  const queryLower = query.toLowerCase().replace(/[^\w\s]/g, ' ');

  // Extract potential article numbers from the query
  // Matches: "article 21", "art. 21", "21A", "article 370" etc.
  const articleNumMatch = query.match(/(?:article|art\.?)\s*(\d+[A-Z]?)/gi);
  const specificNums = articleNumMatch
    ? articleNumMatch.map(m => m.replace(/article|art\.?\s*/gi, '').trim())
    : [];

  let results = [];

  // Priority 1: If user mentioned a specific article number, fetch it directly
  if (specificNums.length > 0) {
    const direct = await Article.find({ number: { $in: specificNums } })
      .sort({ chunkIndex: 1 })
      .limit(topK);
    results = [...direct];
  }

  // Priority 2: MongoDB text search on searchText field
  if (results.length < topK) {
    try {
      const textResults = await Article.find(
        { $text: { $search: queryLower } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(topK - results.length);

      // Avoid duplicates
      const existingIds = new Set(results.map(r => r._id.toString()));
      textResults.forEach(r => {
        if (!existingIds.has(r._id.toString())) results.push(r);
      });
    } catch (e) {
      // Text index might not exist yet, fall through to keyword search
    }
  }

  // Priority 3: Keyword-based fallback search
  if (results.length < topK) {
    const keywords = queryLower
      .split(' ')
      .filter(w => w.length > 3)
      .slice(0, 6);

    if (keywords.length > 0) {
      const keywordRegexes = keywords.map(k => new RegExp(k, 'i'));
      const keywordResults = await Article.find({
        $or: [
          { searchText: { $regex: keywords[0], $options: 'i' } },
          { tags: { $in: keywords } },
          { title: { $regex: keywords.join('|'), $options: 'i' } },
        ],
      })
        .limit(topK * 2);

      // Score by how many keywords match
      const scored = keywordResults.map(r => {
        const text = r.searchText || '';
        const score = keywords.filter(k => text.includes(k)).length;
        return { r, score };
      });
      scored.sort((a, b) => b.score - a.score);

      const existingIds = new Set(results.map(r => r._id.toString()));
      scored.forEach(({ r }) => {
        if (!existingIds.has(r._id.toString()) && results.length < topK) {
          results.push(r);
        }
      });
    }
  }

  return results.slice(0, topK);
};

// ─── Build context string from retrieved chunks ────────────────────────────────
const buildContext = (chunks) => {
  if (!chunks || chunks.length === 0) return '';

  let context = '\n\nRelevant Constitutional Provisions:\n';
  context += '─'.repeat(50) + '\n';

  chunks.forEach(chunk => {
    if (chunk.number && chunk.number !== 'null') {
      context += `\n[${chunk.type === 'preamble' ? 'PREAMBLE' : `Article ${chunk.number}`}`;
      if (chunk.title) context += `: ${chunk.title}`;
      context += ']\n';
    } else if (chunk.title) {
      context += `\n[${chunk.title}]\n`;
    }
    // Limit each chunk to 600 chars to keep prompt size manageable
    const content = chunk.content.length > 600
      ? chunk.content.slice(0, 600) + '...'
      : chunk.content;
    context += content + '\n';
  });

  return context;
};

// ─── CHAT endpoint ─────────────────────────────────────────────────────────────
const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 chars)' });
    }

    // Retrieve relevant constitutional chunks
    const relevantChunks = await retrieveRelevantChunks(message);
    const contextText = buildContext(relevantChunks);

    // Check if we have PDF data or are falling back to basic knowledge
    const hasPDFData = relevantChunks.length > 0;

    const systemPrompt = `You are Vidhi, an AI assistant specialized in the Constitution of India. You help students learn about constitutional rights, articles, and principles in a simple, engaging way.

Your personality:
- Friendly, encouraging, and educational
- Use simple language suitable for students  
- Give examples from everyday Indian life
- Connect constitutional principles to real scenarios
- Keep answers concise (3-5 sentences unless more detail is requested)
- Use relevant emoji occasionally to make it engaging
- If asked about a specific article, always mention its number
- Always cite the article number when referencing constitutional provisions
- If you don't know something, say so honestly
${hasPDFData ? contextText : '\n\nNote: Use your training knowledge about the Indian Constitution.'}

Always encourage further learning and quiz participation.`;

    const messages = [
      ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3-haiku',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || 'I could not generate a response. Please try again.';

    // Extract article references for frontend to show
    const articleRefs = relevantChunks
      .filter(c => c.number && c.number !== 'null' && c.type === 'article')
      .slice(0, 4)
      .map(c => ({ number: c.number, title: c.title }));

    const suggestedTopics = extractTopicSuggestions(reply);

    res.json({
      reply,
      relevantArticles: articleRefs,
      suggestedTopics,
      sourceType: hasPDFData ? 'pdf' : 'knowledge',
    });
  } catch (error) {
    console.error('Chat error:', error);
    if (error.status === 401) return res.status(500).json({ error: 'AI service authentication failed' });
    if (error.status === 429) return res.status(429).json({ error: 'AI rate limit reached. Please try again shortly.' });
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
};

// ─── EXPLAIN ARTICLE endpoint ──────────────────────────────────────────────────
const explainArticle = async (req, res) => {
  try {
    const { articleNumber } = req.params;
    const { level = 'simple' } = req.query;

    // Fetch from MongoDB (parsed from PDF)
    let articles = await Article.find({ number: articleNumber }).sort({ chunkIndex: 1 });

    // Fallback: try case-insensitive search
    if (articles.length === 0) {
      articles = await Article.find({
        searchText: { $regex: `article ${articleNumber}`, $options: 'i' },
      }).limit(3);
    }

    if (articles.length === 0) {
      return res.status(404).json({ error: `Article ${articleNumber} not found in the database. Make sure the PDF has been parsed.` });
    }

    // Combine all chunks for this article
    const fullContent = articles.map(a => a.content).join('\n\n');
    const title = articles[0].title || '';

    const levelInstructions = {
      simple: 'Explain this in very simple terms a school student can understand. Use a relatable everyday Indian example.',
      detailed: 'Provide a detailed legal explanation with context, landmark cases, and implications.',
      story: 'Explain this through a short engaging story or real-life scenario set in modern India.',
    };

    const prompt = `${levelInstructions[level] || levelInstructions.simple}

Article ${articleNumber}: ${title}

${fullContent.slice(0, 1500)}`;

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3-haiku',
      messages: [
        {
          role: 'system',
          content: 'You are Vidhi, an expert on the Constitution of India who teaches it in an engaging, accessible way. Always cite the article number in your explanation.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 700,
      temperature: 0.6,
    });

    res.json({
      article: {
        number: articleNumber,
        title,
        content: fullContent.slice(0, 2000),
      },
      explanation: response.choices[0]?.message?.content,
    });
  } catch (error) {
    console.error('Explain article error:', error);
    res.status(500).json({ error: 'Failed to explain article' });
  }
};

// ─── SEARCH ARTICLES endpoint (new) ───────────────────────────────────────────
const searchArticles = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    const results = await retrieveRelevantChunks(q, parseInt(limit));
    res.json({
      results: results.map(r => ({
        number: r.number,
        title: r.title,
        excerpt: r.content.slice(0, 200) + '...',
        type: r.type,
        tags: r.tags,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const extractTopicSuggestions = (text) => {
  const topics = [];
  const topicMap = {
    'fundamental rights': 'fundamentalRights',
    'right to equality': 'fundamentalRights',
    'right to freedom': 'fundamentalRights',
    'directive principles': 'directivePrinciples',
    'parliament': 'parliament',
    'supreme court': 'judiciary',
    'high court': 'judiciary',
    'judiciary': 'judiciary',
    'emergency': 'emergency',
    'amendment': 'amendments',
    'preamble': 'preamble',
    'duties': 'fundamentalDuties',
  };
  const textLower = text.toLowerCase();
  for (const [keyword, topic] of Object.entries(topicMap)) {
    if (textLower.includes(keyword) && !topics.includes(topic)) {
      topics.push(topic);
    }
  }
  return topics.slice(0, 3);
};

module.exports = { chat, explainArticle, searchArticles };
