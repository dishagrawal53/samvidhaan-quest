# 🇮🇳 Samvidhan Quest

> **A gamified, AI-powered platform to learn the Constitution of India**
> *Making civic education feel like playing a game — quizzes, Snake & Ladders, live multiplayer battles, and an AI tutor grounded in the actual Constitution PDF.*
---
live demo: https://samvidhaan-quest-1.onrender.com
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
- [Output](#-output)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [API Reference](#-api-reference)
- [Socket.IO Events](#-socketio-events)
- [Gamification System](#-gamification-system)
- [AI Chatbot — RAG Pipeline](#-ai-chatbot--rag-pipeline)
- [Deployment on Render](#-deployment-on-render)
- [Roadmap](#-roadmap)


---

## 🎯 About the Project

Most Indians have never read the Constitution. It is 395 articles of dense legal language spread across hundreds of pages. Samvidhan Quest removes that barrier by turning constitutional education into an engaging game.

Users earn XP, level up from *Citizen* to *Constitutional Expert*, battle friends in live quiz rooms, play a Snake & Ladders board where every tile is a constitutional event, and ask an AI tutor questions that are answered directly from the official Constitution of India PDF using RAG (Retrieval-Augmented Generation).

**The Problem:** Constitutional illiteracy despite it being the foundational document of the world's largest democracy.

**The Solution:** Make learning so engaging and rewarding that it does not feel like studying.

---

## Output

### 🏠 Home Page
<img width="931" height="478" alt="Home Page" src="https://github.com/user-attachments/assets/e9245fbe-3d8b-492f-b9c3-0a004628b7ec" />

---

### ✨ Signup Page
<img width="782" height="560" alt="Signup Page" src="https://github.com/user-attachments/assets/eed9c4e7-47e9-4204-bce7-05c18a968bb5" />

---

### 🔐 Login Page
<img width="669" height="452" alt="Login Page" src="https://github.com/user-attachments/assets/19e319a1-7d74-488c-8747-ce7a65f252ef" />

---

### 📊 User Dashboard
<img width="1365" height="643" alt="User Dashboard" src="https://github.com/user-attachments/assets/9dd6c988-123f-4d70-9005-c9345d6f8c2c" />

---

### 🤖 AI Chatbot Interface
<img width="916" height="595" alt="AI Chatbot Interface" src="https://github.com/user-attachments/assets/537fbc6e-c07f-45b6-b40a-abb022532ffd" />

---

### ⚔️ Multiplayer Quiz Battle
<img width="869" height="581" alt="Multiplayer Battle" src="https://github.com/user-attachments/assets/94196c6a-66ca-443d-95bd-f7011b9f9556" />

---

### 🎲 Snake & Ladders – Constitution Edition
<img width="1067" height="651" alt="Snake and Ladders Game" src="https://github.com/user-attachments/assets/26a90281-fb7f-4958-9a30-831ff56163c9" />

---

### 🧠 Scenario-Based Constitutional Challenges
<img width="987" height="582" alt="Scenario Based Challenges" src="https://github.com/user-attachments/assets/da1c80f6-b724-4254-aa37-0afd6b10650f" />

---

### 📚 Learn Section
<img width="1019" height="618" alt="Learn Section" src="https://github.com/user-attachments/assets/a763738e-9ec1-4184-95b3-7c57dccd7b4e" />

---

## ✨ Features

| Feature | Description |
|---|---|
|  **Authentication** | JWT-based signup, login, persistent sessions, guest mode |
|  **Home Dashboard** | XP, level, streak, badges, daily challenge card, quick actions |
|  **Learn Module** | 7 topics with expandable lessons, key points, and article references |
|  **Scenario Challenges** | Apply rights to real-life situations, pick the violated article |
|  **Quiz System** | MCQs with 30s timer, difficulty levels, XP rewards, instant feedback |
|  **Daily Challenge** | Fresh quiz every day, maintains login streak |
|  **Snake & Ladders** | Animated board game with quiz tiles, XP bonuses, snake and ladder events |
|  **Multiplayer Battles** | Socket.IO live quiz rooms, synchronized questions, real-time scores |
|  **AI Chatbot (Vidhi)** | RAG-based AI tutor grounded in the official Constitution PDF |
|  **Leaderboard** | Global rankings by XP, streak, and multiplayer wins |
|  **Profile** | Stats, badges, completed topics, recent activity |
|  **Gamification** | XP, levels, streaks, 7 badge types, achievement popups |

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



<div align="center">

**Jai Hind 🇮🇳**

> *"The Constitution is not a mere lawyers' document, it is a vehicle of Life, and its spirit is always the spirit of Age."*
> — Dr. B.R. Ambedkar

⭐ Star this repo if you found it useful

</div>
