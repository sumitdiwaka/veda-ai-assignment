# VedaAI — AI Assessment Creator

## 🚀 Live Demo
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🏗️ Architecture

```
Client (Next.js) ──HTTP──► Express API ──► BullMQ Queue ──► Worker
       │                                                        │
       └──WebSocket◄────────────────────── Notify ◄───────────┘
                         MongoDB ◄─── Store Results ◄──────────┘
                         Redis   ◄─── Cache + Job State ◄───────┘
```

## Flow
1. Teacher fills Create Assignment form → `POST /api/assignments`
2. API saves to MongoDB, adds job to BullMQ queue
3. Worker picks up job → calls Groq (Llama 3.3 70B) AI
4. AI returns structured JSON → parsed & validated strictly
5. Question Paper saved to MongoDB
6. WebSocket + DB polling notifies frontend in real time
7. Frontend fetches paper → displays structured output
8. Teacher can download as PDF or regenerate

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Cache | Redis (Upstash) |
| Queue | BullMQ |
| Realtime | WebSocket (ws) |
| AI | Groq API (Llama 3.3 70B) |
| PDF | pdf-lib |

## 📦 Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (Upstash free tier)
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd apps/backend
npm install
cp .env.example .env
# Fill in .env values

# Terminal 1 — API Server
npm run dev

# Terminal 2 — Background Worker
npm run worker
```

### Frontend Setup
```bash
cd apps/frontend
npm install
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws" >> .env.local

npm run dev
```

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/assignments | Create + queue generation job |
| GET | /api/assignments | List all assignments |
| GET | /api/assignments/:id | Get assignment details |
| POST | /api/assignments/:id/regenerate | Regenerate paper |
| DELETE | /api/assignments/:id | Delete assignment |
| GET | /api/papers/assignment/:id | Get question paper |
| GET | /api/papers/:id/download | Download as PDF |

## ✨ Features
- ✅ Multi-step assignment creation form
- ✅ File upload (PDF/DOC)
- ✅ AI question generation (Groq Llama 3.3)
- ✅ Real-time progress via WebSocket
- ✅ DB polling fallback
- ✅ Structured question paper output
- ✅ Difficulty badges (Easy/Moderate/Challenging)
- ✅ PDF download
- ✅ Regenerate paper
- ✅ Delete assignments
- ✅ Mobile responsive
- ✅ Redis caching
- ✅ BullMQ background jobs