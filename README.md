# 🇮🇳 Samvidhan Quest

> **A gamified, AI-powered platform to learn the Constitution of India**
> *Making civic education feel like playing a game — quizzes, Snake & Ladders, live multiplayer battles, and an AI tutor grounded in the actual Constitution PDF.*

---

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Socket.IO Events](#-socketio-events)
- [Gamification System](#-gamification-system)
- [AI Chatbot — RAG Pipeline](#-ai-chatbot--rag-pipeline)
- [Deployment on Render](#-deployment-on-render)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 About the Project

Most Indians have never read the Constitution. It is 395 articles of dense legal language spread across hundreds of pages. Samvidhan Quest removes that barrier by turning constitutional education into an engaging game.

Users earn XP, level up from *Citizen* to *Constitutional Expert*, battle friends in live quiz rooms, play a Snake & Ladders board where every tile is a constitutional event, and ask an AI tutor questions that are answered directly from the official Constitution of India PDF using RAG (Retrieval-Augmented Generation).

**The Problem:** Constitutional illiteracy despite it being the foundational document of the world's largest democracy.

**The Solution:** Make learning so engaging and rewarding that it does not feel like studying.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based signup, login, persistent sessions, guest mode |
| 🏠 **Home Dashboard** | XP, level, streak, badges, daily challenge card, quick actions |
| 📚 **Learn Module** | 7 topics with expandable lessons, key points, and article references |
| ⚖️ **Scenario Challenges** | Apply rights to real-life situations, pick the violated article |
| 🎯 **Quiz System** | MCQs with 30s timer, difficulty levels, XP rewards, instant feedback |
| 📅 **Daily Challenge** | Fresh quiz every day, maintains login streak |
| 🐍 **Snake & Ladders** | Animated board game with quiz tiles, XP bonuses, snake and ladder events |
| 👥 **Multiplayer Battles** | Socket.IO live quiz rooms, synchronized questions, real-time scores |
| 🤖 **AI Chatbot (Vidhi)** | RAG-based AI tutor grounded in the official Constitution PDF |
| 🏆 **Leaderboard** | Global rankings by XP, streak, and multiplayer wins |
| 👤 **Profile** | Stats, badges, completed topics, recent activity |
| 🎖️ **Gamification** | XP, levels, streaks, 7 badge types, achievement popups |

---

## 🛠 Tech Stack

### Frontend
- **React 18** — UI library
- **Vite** — Build tool and dev server with proxy
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Animations and transitions
- **Zustand** — Global state management
- **React Router v6** — Client-side routing
- **Socket.IO Client** — Real-time multiplayer
- **Axios** — HTTP client with interceptors
- **React Hot Toast** — Notification system
- **Lucide React** — Icon library

### Backend
- **Node.js + Express 4** — REST API server
- **Socket.IO 4** — WebSocket multiplayer engine
- **MongoDB Atlas + Mongoose** — Database and ODM
- **JWT (jsonwebtoken)** — Authentication
- **bcryptjs** — Password hashing (12 salt rounds)
- **pdf-parse** — Constitution PDF text extraction
- **OpenRouter API** — AI model access (Claude 3 Haiku)
- **helmet** — HTTP security headers
- **express-rate-limit** — API rate limiting

---

## 📁 Project Structure

```
samvidhan-quest/
│
├── backend/
│   ├── config/database.js            # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js         # Signup, login, JWT
│   │   ├── chatController.js         # RAG + OpenRouter AI
│   │   ├── quizController.js         # Quiz engine + grading
│   │   ├── learnController.js        # Topics, lessons, scenarios
│   │   ├── gameController.js         # Snake & Ladder
│   │   ├── leaderboardController.js  # Rankings
│   │   └── userController.js         # Stats, XP
│   ├── data/
│   │   ├── quizData.json             # Seed quiz questions (50+)
│   │   ├── topicsData.json           # Lessons + scenario challenges
│   │   └── boardConfig.json          # Snake/Ladder board layout
│   ├── middleware/auth.js            # JWT verify middleware
│   ├── models/
│   │   ├── User.js                   # User schema with virtuals
│   │   ├── Quiz.js                   # Quiz + QuizResult schemas
│   │   ├── Room.js                   # Multiplayer room schema
│   │   └── Article.js                # Constitution PDF chunks
│   ├── routes/                       # Express route files
│   ├── scripts/startup.js            # Auto-seed + parse on deploy
│   ├── services/socketService.js     # Socket.IO multiplayer engine
│   ├── utils/
│   │   ├── seedData.js               # Manual quiz seeder
│   │   └── parsePDF.js               # Constitution PDF parser (FSM)
│   ├── constitution.pdf              # Official Constitution of India
│   └── server.js                     # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/index.jsx       # XPBar, StatCard, badges etc.
    │   │   └── layout/Layout.jsx      # Sidebar navigation
    │   ├── pages/
    │   │   ├── auth/                  # Welcome, Login, Signup
    │   │   ├── main/                  # Home, Learn, Leaderboard, Profile
    │   │   ├── quiz/                  # Quiz, Result, Daily Challenge
    │   │   ├── game/                  # Snake & Ladder, Multiplayer
    │   │   └── chat/                  # Vidhi AI Chatbot
    │   ├── services/
    │   │   ├── api.js                 # Axios client (all endpoints)
    │   │   └── socket.js              # Socket.IO singleton
    │   ├── store/
    │   │   ├── authStore.js           # Auth + user state
    │   │   └── gameStores.js          # Quiz + Room state
    │   └── utils/constants.js         # Colors, topics, levels
    ├── index.html
    ├── vite.config.js                 # Dev proxy config
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js v18+** — [nodejs.org](https://nodejs.org)
- **MongoDB Atlas account** — [mongodb.com/atlas](https://mongodb.com/atlas) (free tier works)
- **OpenRouter API key** — [openrouter.ai](https://openrouter.ai) (free credits included)

---

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/samvidhan-quest.git

# Install backend dependencies
cd samvidhan-quest/backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and OpenRouter key

# Seed quiz data into MongoDB
npm run seed

# Parse the Constitution PDF (place constitution.pdf in backend/ first)
npm run parse-pdf

# Start development server
npm run dev
```

Backend runs at `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

---

### Frontend Setup

```bash
# Open a new terminal
cd samvidhan-quest/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:3000`

> The Vite dev proxy forwards all `/api` calls to `localhost:5000` automatically. No CORS configuration needed in development.

---

### PDF Parsing Setup

1. Download the official Constitution of India PDF from [legislative.gov.in](https://legislative.gov.in/constitution-of-india/)
2. Place it at `backend/constitution.pdf`
3. Run:

```bash
cd backend
node utils/parsePDF.js constitution.pdf
```

Expected output:
```
✅ MongoDB connected
📃 Extracted 402 pages, 891493 characters
📊 388 chunks found: { article: 379, schedule: 9 }
✅ Stored 388 chunks in MongoDB
🎉 AI chatbot now uses your Constitution PDF
```

---

## 🔑 Environment Variables

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/samvidhan_quest?retryWrites=true&w=majority

# Auth
JWT_SECRET=your_minimum_32_character_secret_key_here
JWT_EXPIRES_IN=30d

# AI
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# CORS
CLIENT_URL=http://localhost:3000
```

For production frontend, set:
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth |
|---|---|---|
| `POST` | `/api/auth/signup` | No |
| `POST` | `/api/auth/login` | No |
| `POST` | `/api/auth/guest` | No |
| `GET` | `/api/auth/me` | ✅ JWT |
| `PATCH` | `/api/auth/profile` | ✅ JWT |

### Quiz
| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/api/quiz/daily` | ✅ JWT |
| `GET` | `/api/quiz/random?topic=all&count=10` | No |
| `GET` | `/api/quiz/topic/:topic` | No |
| `GET` | `/api/quiz/:id` | No |
| `POST` | `/api/quiz/submit` | ✅ JWT |

### Learn
| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/api/learn/topics` | No |
| `GET` | `/api/learn/topics/:id` | No |
| `POST` | `/api/learn/topics/:id/complete` | ✅ JWT |
| `GET` | `/api/learn/scenarios` | No |
| `POST` | `/api/learn/scenarios/submit` | ✅ JWT |

### AI Chat
| Method | Endpoint | Auth |
|---|---|---|
| `POST` | `/api/chat` | ✅ JWT |
| `GET` | `/api/chat/explain/:articleNumber` | ✅ JWT |
| `GET` | `/api/chat/search?q=query` | ✅ JWT |

### Other
| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/api/leaderboard?type=xp` | No |
| `GET` | `/api/users/stats` | ✅ JWT |
| `GET` | `/api/game/board` | No |
| `POST` | `/api/game/result` | ✅ JWT |
| `GET` | `/api/health` | No |

---

## 🔌 Socket.IO Events

### Client → Server
```
room:create   { topic, difficulty, maxPlayers }
room:join     { code }
room:ready
quiz:answer   { questionIndex, selectedOption, timeTaken }
room:leave
```

### Server → Client
```
room:created   { code, room }
room:joined    { code, room }
room:updated   { room }
game:starting  { countdown }
game:question  { question, questionIndex, total }
room:scores    { players }
quiz:answered  { isCorrect, score, correctOption }
game:ended     { results }
error          { message }
```

---

## 🎮 Gamification System

### Level Titles

| Level | Title | XP Required |
|---|---|---|
| 1–2 | 🧑 Citizen | 0 |
| 3–4 | 📚 Law Student | 1,000 |
| 5–6 | 👔 Advocate | 2,000 |
| 7–9 | ⚖️ Barrister | 3,500 |
| 10–14 | 👨‍⚖️ Judge | 5,000 |
| 15–19 | 🏛️ Senior Advocate | 7,500 |
| 20+ | 🌟 Constitutional Expert | 10,000 |

### XP Rewards

| Action | XP |
|---|---|
| Quiz correct answer | 10 base |
| Complete quiz (score-weighted) | Up to 150 |
| Daily challenge | Up to 150 |
| Complete a topic | 50–100 |
| Scenario correct | 75 |
| Multiplayer win | 200 |
| Multiplayer participation | 50 |

### Badges

| Badge | Trigger |
|---|---|
| 🇮🇳 Welcome Citizen | Join the app |
| 🎯 First Quiz! | Complete first quiz |
| 🏆 Quiz Veteran | Complete 10 quizzes |
| 🔥 7-Day Streak | 7 consecutive days |
| 🧠 Sharp Mind | 80%+ accuracy on 20+ answers |
| ⚖️ Advocate | Reach Level 5 |
| 👨‍⚖️ The Judge | Reach Level 10 |

---

## 🤖 AI Chatbot — RAG Pipeline

Vidhi AI answers are grounded in the actual Constitution text using a 3-tier retrieval system:

```
User message
    ↓
Tier 1: Direct article number lookup   (e.g. "article 21" → Article.find({number:"21"}))
    ↓ if < 5 results
Tier 2: MongoDB full-text search       ($text index on searchText field)
    ↓ if < 5 results
Tier 3: Keyword regex fallback         (split query, score by match count)
    ↓
Top 5 chunks → Build context string → Inject into system prompt
    ↓
OpenRouter API (claude-3-haiku) → Response + article refs + topic suggestions
```

The PDF parser uses a **finite-state machine** detecting article boundaries via Unicode em-dash `\u2014` in the pattern `NUMBER. TITLE.—CONTENT`, correctly extracting all 379 articles from the 402-page government PDF.

---

## 🚢 Deployment on Render

### Backend — Web Service

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm run setup && node server.js` |

The `setup` script auto-seeds quizzes and parses the PDF on first deploy. Subsequent deploys skip both if data already exists.

### Frontend — Static Site

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

### Environment Variables on Render

**Backend:** `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `NODE_ENV=production`, `CLIENT_URL=<frontend-url>`

**Frontend:** `VITE_API_URL=https://your-backend.onrender.com/api`, `VITE_SOCKET_URL=https://your-backend.onrender.com`

> ⚠️ Free tier backends spin down after 15 min inactivity. Use [UptimeRobot](https://uptimerobot.com) to ping `/api/health` every 5 minutes.

---

## 🗺 Roadmap

- [ ] Hindi and regional language support
- [ ] Vector embeddings for smarter AI retrieval
- [ ] Teacher dashboard with custom quiz creation
- [ ] Digital certificates on topic completion
- [ ] Voice mode for AI chatbot
- [ ] Offline quiz mode
- [ ] React Native mobile app
- [ ] Landmark Supreme Court case integration

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

To add quiz questions: edit `backend/data/quizData.json` then run `npm run seed`.
To add topics or scenarios: edit `backend/data/topicsData.json`.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Jai Hind 🇮🇳**

> *"The Constitution is not a mere lawyers' document, it is a vehicle of Life, and its spirit is always the spirit of Age."*
> — Dr. B.R. Ambedkar

⭐ Star this repo if you found it useful

</div>