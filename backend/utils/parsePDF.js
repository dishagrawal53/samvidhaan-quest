require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const pdfParse = require('pdf-parse');
const Article = require('../models/Article');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const PDF_PATH = process.argv[2] || path.join(__dirname, '../../constitution.pdf');
const CHUNK_SIZE = 800;
const EM_DASH = '\u2014'; // real Unicode em-dash used in this PDF

// ─── CONNECT ──────────────────────────────────────────────────────────────────
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');
};

// ─── CLEAN TEXT ───────────────────────────────────────────────────────────────
const cleanText = (text) => text
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n')
  .replace(/^\s*\d+\s*$/gm, '')   // remove lone page numbers
  .replace(/\n{3,}/g, '\n\n')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

// ─── PARSE ────────────────────────────────────────────────────────────────────
const parseArticles = (text) => {
  const lines = text.split('\n');
  const chunks = [];

  // Regex: article starts with NUMBER. then a capital letter
  const ART_RE   = /^(\d{1,3}[A-Z]?)\.\s{1,6}([A-Z][^]+)/;
  const PART_RE   = /^PART\s+([IVXLC]+)\s*$/i;
  const SCHED_RE  = /^(?:THE\s+)?(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH)\s+SCHEDULE\s*$/i;

  // Find where actual constitutional text starts
  // (first line matching "NUMBER. Title.—" with em-dash, past line 100)
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (ART_RE.test(t) && t.includes(EM_DASH) && i > 100) {
      startIdx = Math.max(0, i - 10);
      break;
    }
  }
  console.log(`📍 Content starts at line ${startIdx}`);

  let currentNum = null;
  let currentTitle = '';
  let currentContent = [];
  let currentPart = '';

  const flushChunk = () => {
    if (!currentNum || !currentContent.length) return;
    const content = currentContent.join(' ').replace(/\s+/g, ' ').trim();
    if (content.length < 30) return;

    const words = content.split(/\s+/);

    if (words.length > CHUNK_SIZE) {
      const numChunks = Math.ceil(words.length / CHUNK_SIZE);
      for (let i = 0; i < numChunks; i++) {
        const chunkContent = words.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE).join(' ');
        chunks.push(makeChunk(currentNum, currentTitle, chunkContent, currentPart, i));
      }
    } else {
      chunks.push(makeChunk(currentNum, currentTitle, content, currentPart, 0));
    }

    currentContent = [];
  };

  for (let i = startIdx; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;

    // PART header
    const partM = t.match(PART_RE);
    if (partM) {
      currentPart = `Part ${partM[1].toUpperCase()}`;
      continue;
    }

    // SCHEDULE header — save current chunk and start schedule
    const schedM = t.match(SCHED_RE);
    if (schedM) {
      flushChunk();
      currentNum = `Sch-${schedM[1]}`;
      currentTitle = `${schedM[1]} Schedule`;
      currentContent = [t];
      continue;
    }

    // ARTICLE — must have em-dash in this line or the next two lines
    const artM = t.match(ART_RE);
    if (artM) {
      const num = artM[1];
      const numInt = parseInt(num);
      const hasEmDash =
        t.includes(EM_DASH) ||
        (lines[i + 1] && lines[i + 1].includes(EM_DASH)) ||
        (lines[i + 2] && lines[i + 2].includes(EM_DASH));

      // Title is everything between "NUMBER." and the em-dash
      const titleCandidate = t.split(EM_DASH)[0]
        .replace(/^\d+[A-Z]?\.\s*/, '')
        .replace(/\.$/, '')
        .trim();

      const isValidArticle =
        hasEmDash &&
        numInt >= 1 &&
        numInt <= 395 &&
        titleCandidate.length > 5;

      if (isValidArticle) {
        flushChunk();
        currentNum = num;
        currentTitle = titleCandidate;
        currentContent = [t];
        continue;
      }
    }

    // Otherwise append to current chunk
    currentContent.push(t);
  }

  flushChunk(); // save last article
  return chunks;
};

// ─── CHUNK BUILDER ────────────────────────────────────────────────────────────
const makeChunk = (num, title, content, part, chunkIndex) => ({
  number: num,
  title: title.trim(),
  content,
  part,
  type: detectType(num),
  chunkIndex,
  wordCount: content.split(/\s+/).length,
  searchText: `article ${num} ${title} ${content}`.toLowerCase().replace(/[^\w\s]/g, ' '),
  tags: buildTags(num, title, content),
});

const detectType = (num) => {
  if (!num) return 'other';
  if (num === 'Preamble') return 'preamble';
  if (String(num).startsWith('Sch-')) return 'schedule';
  return 'article';
};

const buildTags = (num, title, content) => {
  const tags = [];
  const combined = `${title} ${content}`.toLowerCase();
  const tagMap = {
    'fundamental rights':   ['fundamental rights', 'right to'],
    'equality':             ['equality before law', 'equal protection', 'discrimination'],
    'freedom':              ['freedom of speech', 'freedom of expression'],
    'religion':             ['freedom of religion', 'religious affairs'],
    'life liberty':         ['life and personal liberty'],
    'education':            ['right to education', 'free and compulsory'],
    'parliament':           ['parliament', 'lok sabha', 'rajya sabha'],
    'president':            ['president of india', 'the president shall'],
    'prime minister':       ['prime minister'],
    'supreme court':        ['supreme court'],
    'high court':           ['high court'],
    'emergency':            ['proclamation of emergency', 'national emergency'],
    'amendment':            ['amendment act', 'amend the constitution'],
    'directive principles': ['directive principles'],
    'fundamental duties':   ['fundamental duties'],
    'preamble':             ['sovereign', 'secular', 'democratic', 'republic'],
    'judiciary':            ['chief justice', 'judge of the supreme'],
    'citizenship':          ['citizenship', 'citizen of india'],
    'trade commerce':       ['trade and commerce', 'freedom of trade'],
    'finance':              ['consolidated fund', 'annual financial'],
    'election':             ['election commission', 'free and fair'],
    'language':             ['official language', 'hindi language'],
    'property':             ['right to property', 'acquisition of property'],
    'minority':             ['minority', 'minorities'],
    'scheduled tribe':      ['scheduled tribe', 'scheduled caste'],
    'local government':     ['panchayat', 'municipality', 'local bodies'],
  };
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(kw => combined.includes(kw))) tags.push(tag);
  }
  if (num) tags.push(`article-${num}`);
  return tags;
};

// ─── DEDUPLICATE ──────────────────────────────────────────────────────────────
const deduplicate = (chunks) => {
  const seen = new Set();
  return chunks.filter(c => {
    if (!c.number) return false;
    const key = `${c.number}-${c.chunkIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const main = async () => {
  try {
    await connectDB();

    if (!fs.existsSync(PDF_PATH)) {
      throw new Error(`PDF not found: ${PDF_PATH}`);
    }

    console.log(`📄 Reading: ${PDF_PATH}`);
    const buffer = fs.readFileSync(PDF_PATH);
    const data = await pdfParse(buffer);
    console.log(`📃 ${data.numpages} pages, ${data.text.length} characters`);

    const cleaned = cleanText(data.text);

    console.log('🔍 Parsing articles...');
    const raw = parseArticles(cleaned);
    const chunks = deduplicate(raw);

    // Stats
    const types = chunks.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});
    console.log(`📊 ${chunks.length} chunks found:`, types);

    // Clear and insert
    console.log('🗑️  Clearing existing data...');
    await Article.deleteMany({});

    let inserted = 0;
    for (let i = 0; i < chunks.length; i += 50) {
      await Article.insertMany(chunks.slice(i, i + 50), { ordered: false });
      inserted += Math.min(50, chunks.length - i);
      process.stdout.write(`\r💾 Inserted ${inserted}/${chunks.length}...`);
    }

    console.log(`\n✅ Stored ${inserted} chunks in MongoDB`);

    // Show sample
    console.log('\n📋 Sample articles:');
    const samples = await Article.find({ type: 'article' })
      .sort({ number: 1 })
      .limit(15)
      .select('number title wordCount');
    samples.forEach(s =>
      console.log(`  Art.${String(s.number).padEnd(5)} | ${String(s.title).slice(0, 55).padEnd(55)} | ${s.wordCount}w`)
    );

    const total = await Article.countDocuments({ type: 'article' });
    console.log(`\n🎉 Done! ${total} articles stored. The AI chatbot now uses your Constitution PDF.`);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
};

main();
