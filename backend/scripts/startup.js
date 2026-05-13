require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(' MongoDB connected');
};

const shouldSeed = async () => {
  const { Quiz } = require('../models/Quiz');
  const count = await Quiz.countDocuments();
  return count === 0;
};

const shouldParsePDF = async () => {
  const Article = require('../models/Article');
  const count = await Article.countDocuments();
  return count < 100;
};

const main = async () => {
  try {
    await connectDB();

    // Seed quizzes if DB is empty
    if (await shouldSeed()) {
      console.log(' Seeding quiz data...');
      const { Quiz } = require('../models/Quiz');
      const quizData = require('../data/quizData.json');
      const quizzes = quizData.quizzes.map(q => ({
        title: q.title,
        topic: q.topic,
        difficulty: q.difficulty,
        xpReward: q.xpReward || 100,
        isDaily: q.isDaily || false,
        isActive: true,
        questions: q.questions,
      }));
      await Quiz.insertMany(quizzes);
      console.log(` Seeded ${quizzes.length} quizzes`);
    } else {
      console.log(' Quizzes already seeded, skipping');
    }

    // Parse PDF if articles are missing
    if (await shouldParsePDF()) {
      const pdfPath = path.join(__dirname, '../constitution.pdf');
      if (fs.existsSync(pdfPath)) {
        console.log(' Parsing Constitution PDF...');
        // Inline the parse logic
        const pdfParse = require('pdf-parse');
        const Article = require('../models/Article');

        const buffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(buffer);
        const EM = '\u2014';
        const ART_RE = /^(\d{1,3}[A-Z]?)\.\s{1,6}([A-Z][^]+)/;
        const PART_RE = /^PART\s+([IVXLC]+)\s*$/i;
        const SCHED_RE = /^(?:THE\s+)?(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH)\s+SCHEDULE\s*$/i;

        const lines = data.text
          .replace(/\r\n/g, '\n')
          .replace(/[ \t]{2,}/g, ' ')
          .replace(/^\s*\d+\s*$/gm, '')
          .split('\n');

        let startIdx = 0;
        for (let i = 0; i < lines.length; i++) {
          const t = lines[i].trim();
          if (ART_RE.test(t) && t.includes(EM) && i > 100) {
            startIdx = Math.max(0, i - 10);
            break;
          }
        }

        let num = null, title = '', content = [], part = '';
        const chunks = [];
        const seen = new Set();

        const flush = () => {
          if (!num || !content.length) return;
          const c = content.join(' ').replace(/\s+/g, ' ').trim();
          if (c.length < 30) return;
          const key = `${num}-0`;
          if (seen.has(key)) return;
          seen.add(key);
          const words = c.split(/\s+/);
          const CHUNK = 800;
          if (words.length > CHUNK) {
            const n = Math.ceil(words.length / CHUNK);
            for (let i = 0; i < n; i++) {
              chunks.push({
                number: num, title, part,
                content: words.slice(i * CHUNK, (i + 1) * CHUNK).join(' '),
                type: num.startsWith('Sch') ? 'schedule' : num === 'Preamble' ? 'preamble' : 'article',
                chunkIndex: i,
                wordCount: Math.min(CHUNK, words.length - i * CHUNK),
                searchText: `article ${num} ${title} ${c}`.toLowerCase().replace(/[^\w\s]/g, ' '),
                tags: [`article-${num}`],
              });
            }
          } else {
            chunks.push({
              number: num, title, part, content: c,
              type: num.startsWith('Sch') ? 'schedule' : num === 'Preamble' ? 'preamble' : 'article',
              chunkIndex: 0, wordCount: words.length,
              searchText: `article ${num} ${title} ${c}`.toLowerCase().replace(/[^\w\s]/g, ' '),
              tags: [`article-${num}`],
            });
          }
          content = [];
        };

        for (let i = startIdx; i < lines.length; i++) {
          const t = lines[i].trim();
          if (!t) continue;
          if (PART_RE.test(t)) { part = t; continue; }
          if (SCHED_RE.test(t)) {
            flush(); num = `Sch-${t}`; title = t; content = [t]; continue;
          }
          const artM = t.match(ART_RE);
          if (artM) {
            const n = artM[1], ni = parseInt(n);
            const hasED = t.includes(EM) || (lines[i+1] && lines[i+1].includes(EM)) || (lines[i+2] && lines[i+2].includes(EM));
            const tc = t.split(EM)[0].replace(/^\d+[A-Z]?\.\s*/, '').replace(/\.$/, '').trim();
            if (hasED && ni >= 1 && ni <= 395 && tc.length > 5) {
              flush(); num = n; title = tc; content = [t]; continue;
            }
          }
          content.push(t);
        }
        flush();

        await Article.deleteMany({});
        let inserted = 0;
        for (let i = 0; i < chunks.length; i += 50) {
          await Article.insertMany(chunks.slice(i, i + 50), { ordered: false });
          inserted += Math.min(50, chunks.length - i);
        }
        console.log(` Parsed and stored ${inserted} constitution chunks`);
      } else {
        console.log('  constitution.pdf not found, skipping PDF parse');
        console.log('   Place constitution.pdf in the backend folder');
      }
    } else {
      console.log('  Constitution already parsed, skipping');
    }

    mongoose.connection.close();
    console.log(' Startup tasks complete');
    process.exit(0);
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
};

main();