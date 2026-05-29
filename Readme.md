# VedaAI — AI Assessment Creator

<div align="center">

![VedaAI Banner](https://img.shields.io/badge/VedaAI-AI%20Assessment%20Creator-f97316?style=for-the-badge&logo=openai&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red?style=flat-square&logo=redis)](https://upstash.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-orange?style=flat-square)](https://console.groq.com/)

**A full-stack AI-powered assessment creation platform for teachers.**  
Create assignments → Generate question papers using AI → Download as PDF

[🚀 Live Demo](https://veda-ai-assignment-frontend-ten.vercel.app) · [📖 API Docs](#-api-reference) · [🐛 Report Bug](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [WebSocket Events](#-websocket-events)
- [AI Prompt Strategy](#-ai-prompt-strategy)
- [Deploy Guide](#-deploy-guide)
- [Known Issues](#-known-issues)

---

## 🎯 Overview

**VedaAI** is an AI-powered assessment creator built for teachers. It allows educators to:

1. **Create assignments** with custom question types, marks, and difficulty levels
2. **Generate question papers** automatically using Groq AI (Llama 3.3 70B)
3. **View structured output** with sections, difficulty badges, and proper formatting
4. **Download as PDF** in professional exam paper format
5. **Regenerate** papers if they're not satisfied with the output

The system uses a **background job queue (BullMQ)** for AI generation, **WebSocket** for real-time progress updates, and **Redis** for caching — making it production-ready and scalable.

---

## ✨ Features

### Core Features
- ✅ **Multi-step Assignment Form** — title, subject, grade, topic, due date, file upload
- ✅ **Multiple Question Types** — MCQ, Short Answer, Long Answer, True/False, Fill in the Blank
- ✅ **Configurable Marks & Count** — per question type with stepper controls
- ✅ **File Upload** — PDF, DOC, DOCX, TXT support via Multer
- ✅ **AI Question Generation** — Groq Llama 3.3 70B Versatile model
- ✅ **Structured Output** — sections (A, B, C...), numbered questions, difficulty tags
- ✅ **Real-time Progress** — WebSocket notifications + DB polling fallback
- ✅ **PDF Download** — professional exam paper format with Times Roman font
- ✅ **Regenerate Paper** — one-click regeneration with fresh AI output
- ✅ **Delete Assignments** — with confirmation modal
- ✅ **Assignment Dashboard** — live count, status badges, search & filter

### Bonus Features
- ✅ **Redis Caching** — fast repeated fetches
- ✅ **BullMQ Background Jobs** — non-blocking AI generation
- ✅ **DB Polling Fallback** — works even if Redis/BullMQ is unreliable
- ✅ **Difficulty Badges** — Easy (green) / Moderate (amber) / Challenging (red)
- ✅ **Mobile Responsive** — works on all screen sizes
- ✅ **General Instructions** — standard exam instructions auto-included
- ✅ **Sidebar Live Badge** — assignment count updates in real-time

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.6 | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Zustand | 5.x | State management |
| Axios | 1.x | HTTP client |
| React Hook Form | 7.x | Form handling |
| Zod | 4.x | Schema validation |
| React Dropzone | 15.x | File upload UI |
| React Hot Toast | 2.x | Notifications |
| Lucide React | latest | Icons |
| Framer Motion | 12.x | Animations |
| Tailwind CSS | 4.x | Styling |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20+ | Runtime |
| Express | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Mongoose | 8.x | MongoDB ODM |
| BullMQ | 5.x | Background job queue |
| ioredis | 5.x | Redis client |
| ws | 8.x | WebSocket server |
| Multer | 1.x | File upload handling |
| Zod | 3.x | Request validation |
| pdf-lib | 1.x | PDF generation |
| Groq SDK | latest | AI API client |
| Morgan | 1.x | HTTP request logging |
| Helmet | 7.x | Security headers |
| dotenv | 16.x | Environment variables |
| ts-node-dev | 2.x | Development server |

### Infrastructure
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| MongoDB Atlas | Database | 512MB free |
| Upstash Redis | Cache + Queue | 10k commands/day |
| Groq API | AI Generation | Free tier available |
| Render | Backend hosting | 750 hrs/month |
| Vercel | Frontend hosting | Unlimited |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js)                         │
│                                                                   │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │ Zustand  │  │  API Service │  │    WebSocket Hook          │ │
│  │  Store   │  │   (Axios)    │  │  (Real-time updates)       │ │
│  └──────────┘  └──────┬───────┘  └───────────┬────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                         │ HTTP                  │ WS
                         ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express)                           │
│                                                                   │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │ Routes  │  │Controllers│  │Middleware│  │  WS Server      │  │
│  │         │→ │          │→ │ Zod/     │  │  (notify        │  │
│  │/assign  │  │assignment │  │ Multer   │  │   clients)      │  │
│  │/papers  │  │paper      │  │          │  │                 │  │
│  └─────────┘  └─────┬────┘  └──────────┘  └─────────────────┘  │
│                      │                                            │
│               ┌──────▼────────┐                                  │
│               │  BullMQ Queue │                                  │
│               │  (Redis)      │                                  │
│               └──────┬────────┘                                  │
└──────────────────────────────────────────────────────────────────┘
                        │ Job
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WORKER (Separate Process)                      │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ BullMQ      │  │  AI Service  │  │   DB Polling         │   │
│  │ Worker      │→ │  (Groq API)  │  │   Fallback           │   │
│  │             │  │  Llama 3.3   │  │   (every 5s)         │   │
│  └─────────────┘  └──────┬───────┘  └──────────────────────┘   │
│                           │                                       │
│              ┌────────────▼────────────┐                         │
│              │   Response Parser       │                         │
│              │   (strict validation)   │                         │
│              └────────────┬────────────┘                         │
└───────────────────────────────────────────────────────────────── ┘
                            │
              ┌─────────────▼─────────────┐
              │         MongoDB            │
              │  assignments collection    │
              │  questionpapers collection │
              └─────────────┬─────────────┘
                            │
              ┌─────────────▼─────────────┐
              │     Redis (Upstash)        │
              │  - Paper cache (24h)       │
              │  - Assignment cache (1h)   │
              │  - Job status (2h)         │
              └───────────────────────────┘
```

### Request Flow
```
1. POST /api/assignments
       │
       ├── Validate request (Zod)
       ├── Save to MongoDB (status: "pending")
       ├── Add job to BullMQ queue
       └── Return { assignmentId, jobId }

2. Worker picks up job
       │
       ├── Update status → "processing"
       ├── Build prompt from assignment data
       ├── Call Groq AI API (Llama 3.3 70B)
       ├── Parse & validate JSON response
       ├── Save QuestionPaper to MongoDB
       ├── Update assignment (status: "completed", paperId)
       ├── Cache paper in Redis
       └── Notify frontend via WebSocket

3. Frontend polling (every 3s)
       │
       ├── GET /api/assignments/:id
       ├── Check status === "completed"
       └── Redirect to output page

4. Output page
       │
       ├── GET /api/papers/assignment/:id
       ├── Display structured question paper
       └── Download PDF via GET /api/papers/:id/download
```

---

## 📁 Folder Structure

```
vedaai/
├── package.json                          # Root monorepo config
├── README.md
│
├── apps/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── index.ts                  # Express app entry point
│   │       │
│   │       ├── config/
│   │       │   ├── db.ts                 # MongoDB connection
│   │       │   ├── redis.ts              # Redis connections (BullMQ + cache)
│   │       │   └── env.ts                # Zod env validation
│   │       │
│   │       ├── models/
│   │       │   ├── Assignment.ts         # Assignment mongoose schema
│   │       │   └── QuestionPaper.ts      # Question paper mongoose schema
│   │       │
│   │       ├── routes/
│   │       │   ├── assignment.routes.ts  # CRUD + regenerate routes
│   │       │   └── paper.routes.ts       # Paper fetch + PDF download
│   │       │
│   │       ├── controllers/
│   │       │   ├── assignment.controller.ts
│   │       │   └── paper.controller.ts
│   │       │
│   │       ├── services/
│   │       │   ├── ai.service.ts         # Groq API integration
│   │       │   ├── pdf.service.ts        # PDF generation with pdf-lib
│   │       │   └── cache.service.ts      # Redis cache helpers
│   │       │
│   │       ├── queues/
│   │       │   ├── assignment.queue.ts   # BullMQ queue definition
│   │       │   └── assignment.worker.ts  # BullMQ worker + DB fallback
│   │       │
│   │       ├── websocket/
│   │       │   └── ws.server.ts          # WebSocket server + room management
│   │       │
│   │       ├── middleware/
│   │       │   ├── validate.ts           # Zod request validation
│   │       │   ├── upload.ts             # Multer file upload config
│   │       │   └── error.ts              # Global error handler
│   │       │
│   │       └── utils/
│   │           ├── promptBuilder.ts      # AI prompt construction
│   │           └── responseParser.ts     # AI response validation & parsing
│   │
│   └── frontend/
│       ├── package.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── postcss.config.js
│       ├── .env.local.example
│       └── src/
│           ├── app/
│           │   ├── layout.tsx            # Root layout + Toast provider
│           │   ├── page.tsx              # Redirect → /assignments
│           │   ├── globals.css           # Global styles
│           │   ├── assignments/
│           │   │   ├── page.tsx          # Assignments list page
│           │   │   ├── create/
│           │   │   │   └── page.tsx      # Multi-step create form
│           │   │   └── [id]/
│           │   │       └── page.tsx      # Question paper output page
│           │   ├── groups/page.tsx
│           │   ├── toolkit/page.tsx
│           │   ├── library/page.tsx
│           │   └── settings/page.tsx
│           │
│           ├── components/
│           │   ├── layout/
│           │   │   ├── AppShell.tsx      # Sidebar + Header wrapper
│           │   │   ├── Sidebar.tsx       # Navigation sidebar
│           │   │   ├── Header.tsx        # Top header bar
│           │   │   └── MobileNav.tsx     # Bottom tab bar (mobile)
│           │   │
│           │   └── ui/
│           │       ├── Button.tsx
│           │       ├── Modal.tsx
│           │       ├── Badge.tsx
│           │       └── Spinner.tsx
│           │
│           ├── hooks/
│           │   └── useWebSocket.ts       # WS connection with auto-reconnect
│           │
│           ├── services/
│           │   ├── api.ts                # Axios base config
│           │   ├── assignmentService.ts  # Assignment API calls
│           │   └── paperService.ts       # Paper API calls
│           │
│           ├── store/
│           │   ├── assignmentStore.ts    # Zustand assignments state
│           │   └── createStore.ts        # Zustand create form state
│           │
│           └── types/
│               ├── assignment.ts         # Assignment TypeScript types
│               └── paper.ts              # Paper TypeScript types
```

---

## 🚀 Local Setup

### Prerequisites
- **Node.js** 20+ — https://nodejs.org
- **MongoDB** — local install or Atlas free tier
- **Redis** — Upstash free tier (recommended) or local
- **Groq API Key** — free at https://console.groq.com
- **Git**

### Step 1 — Clone Repository

```bash
git clone https://github.com/yourusername/vedaai.git
cd vedaai
```

### Step 2 — Backend Setup

```bash
cd apps/backend
npm install
cp .env.example .env
```

Edit `.env` file with your credentials (see Environment Variables section below).

```bash
# Terminal 1 — Start API Server
npm run dev

# Terminal 2 — Start Background Worker (REQUIRED for AI generation)
npm run worker
```

You should see:
```
✅ MongoDB connected
✅ Redis (BullMQ) connected
🚀 VedaAI Backend running on port 5000
📡 WebSocket at ws://localhost:5000/ws
```

And in worker terminal:
```
✅ MongoDB connected
✅ BullMQ Worker RUNNING and listening for jobs...
✅ DB Polling Fallback started (checks every 5s)
```

### Step 3 — Frontend Setup

```bash
cd apps/frontend
npm install
```

Create `.env.local`:
```bash
# Windows
echo NEXT_PUBLIC_API_URL=http://localhost:5000/api > .env.local
echo NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws >> .env.local

# Mac/Linux
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws" >> .env.local
```

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

### Step 4 — Verify Everything Works

```bash
# Test backend health
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"VedaAI Backend"}
```

---

## 🔐 Environment Variables

### Backend — `apps/backend/.env`

```env
# ─── Server ────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── Database ──────────────────────────────────────────────
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/vedaai

# OR MongoDB Atlas (production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vedaai

# ─── Redis ─────────────────────────────────────────────────
# Local Redis
REDIS_URL=redis://localhost:6379

# OR Upstash Redis (recommended)
# REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379

# ─── AI ────────────────────────────────────────────────────
# Get free key at: https://console.groq.com
GROQ_API_KEY=gsk_your_groq_api_key_here

# ─── CORS ──────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000

# ─── File Upload ───────────────────────────────────────────
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads
```

### Frontend — `apps/frontend/.env.local`

```env
# Local development
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws

# Production (after deploy)
# NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
# NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com/ws
```

---

## 🔌 API Reference

### Health Check
```
GET /health
Response: { "status": "ok", "timestamp": "...", "service": "VedaAI Backend" }
```

### Assignments

#### Create Assignment
```
POST /api/assignments
Content-Type: multipart/form-data (if file) OR application/json

Body:
{
  "title": "Science Quiz Chapter 5",        // required, min 3 chars
  "subject": "Science",                      // required
  "grade": "Grade 8",                        // required
  "topic": "Electromagnetism",               // required
  "dueDate": "2026-06-15T23:59:59.000Z",    // required, ISO string
  "questionConfigs": [                        // required, min 1 item
    {
      "type": "mcq",                         // mcq|short_answer|long_answer|true_false|fill_blank
      "count": 5,                            // min 1, max 50
      "marksPerQuestion": 2,                 // min 1, max 20
      "difficulty": "medium"                 // easy|medium|hard (optional)
    }
  ],
  "additionalInstructions": "3 hour exam"   // optional, max 1000 chars
}

Response 201:
{
  "success": true,
  "data": {
    "assignmentId": "6a16d7ba...",
    "jobId": "assignment-6a16d7ba...",
    "status": "pending",
    "message": "Assignment created. Generation queued."
  }
}
```

#### Get All Assignments
```
GET /api/assignments
Response 200:
{
  "success": true,
  "data": [Assignment]
}
```

#### Get Assignment by ID
```
GET /api/assignments/:id
Response 200:
{
  "success": true,
  "data": Assignment
}
```

#### Regenerate Assignment
```
POST /api/assignments/:id/regenerate
Response 200:
{
  "success": true,
  "data": { "assignmentId": "...", "jobId": "...", "status": "pending" }
}
```

#### Delete Assignment
```
DELETE /api/assignments/:id
Response 200:
{
  "success": true,
  "message": "Deleted successfully"
}
```

### Papers

#### Get Paper by Assignment ID
```
GET /api/papers/assignment/:assignmentId
Response 200:
{
  "success": true,
  "data": QuestionPaper
}
```

#### Get Paper by Paper ID
```
GET /api/papers/:id
Response 200:
{
  "success": true,
  "data": QuestionPaper
}
```

#### Download Paper as PDF
```
GET /api/papers/:id/download
Response: PDF file (application/pdf)
Content-Disposition: attachment; filename="science-grade8-exam.pdf"
```

### Data Models

#### Assignment
```typescript
{
  _id: string
  title: string
  subject: string
  grade: string
  topic: string
  dueDate: Date
  questionConfigs: QuestionConfig[]
  additionalInstructions?: string
  fileName?: string
  filePath?: string
  totalMarks: number
  totalQuestions: number
  jobId?: string
  status: "pending" | "processing" | "completed" | "failed"
  paperId?: string
  createdAt: Date
  updatedAt: Date
}
```

#### QuestionPaper
```typescript
{
  _id: string
  assignmentId: string
  title: string
  subject: string
  grade: string
  topic: string
  dueDate: Date
  sections: Section[]
  totalMarks: number
  totalQuestions: number
  duration?: number
  generalInstructions: string[]
  pdfPath?: string
  createdAt: Date
}
```

---

## 📡 WebSocket Events

**Connect:** `ws://localhost:5000/ws`

**Subscribe to assignment updates:**
```json
{ "type": "subscribe", "assignmentId": "6a16d7ba..." }
```

**Server confirmation:**
```json
{ "type": "subscribed", "assignmentId": "6a16d7ba...", "message": "Subscribed" }
```

**Events you receive:**

| Event | Progress | Description |
|-------|----------|-------------|
| `job:queued` | 5% | Job added to BullMQ queue |
| `job:processing` | 10% | Worker started processing |
| `job:progress` | 35-85% | AI generation in progress |
| `job:completed` | 100% | Paper ready, includes `paperId` |
| `job:failed` | - | Error occurred, includes `error` message |

**Example event payload:**
```json
{
  "type": "job:completed",
  "assignmentId": "6a16d7ba...",
  "jobId": "assignment-6a16d7ba...",
  "paperId": "6a16d8xx...",
  "progress": 100,
  "message": "Question paper generated successfully!"
}
```

---

## 🧠 AI Prompt Strategy

The system converts teacher's form input into a carefully crafted prompt:

### Step 1 — Prompt Building (`promptBuilder.ts`)
```
Input: { subject, grade, topic, questionConfigs[], additionalInstructions }
         ↓
Output: Detailed prompt with:
  - Assignment details (subject, grade, topic)
  - Per-section specs (type, count, exact marks, difficulty)
  - Strict JSON schema with field types
  - Explicit marks enforcement rule
  - Standard + teacher custom general instructions
```

### Step 2 — AI Generation (`ai.service.ts`)
```
Model: Groq Llama 3.3 70B Versatile
Temperature: 0.7 (creative but consistent)
Max Tokens: 4096
System prompt: "Always respond with valid JSON only"
```

### Step 3 — Response Parsing (`responseParser.ts`)
```
Raw AI text
  ↓ Strip any markdown fences
  ↓ JSON.parse()
  ↓ Validate sections array exists
  ↓ For each section → validate questions
  ↓ For each question:
    - Sanitize text (trim, normalize spaces)
    - Validate difficulty (default: "medium")
    - Validate type (default: "short_answer")
    - Ensure marks is a number
    - Validate MCQ options if present
  ↓ Calculate totals
  ↓ Return structured ParsedPaper object
```

**Why this approach?**
- Raw LLM response is **never rendered directly**
- Every field is validated and sanitized
- Malformed responses throw errors → job marked as failed
- Worker retries automatically

---

## 🚀 Deploy Guide

### Prerequisites for Deploy
- GitHub account with code pushed
- MongoDB Atlas account (free)
- Upstash account (free)
- Render account (free)
- Vercel account (free)

---

### Step 1 — Push to GitHub

```bash
# In root of project
git init
git add .
git commit -m "feat: initial VedaAI implementation"
git branch -M main
git remote add origin https://github.com/yourusername/vedaai.git
git push -u origin main
```

---

### Step 2 — MongoDB Atlas Setup

1. Go to **https://mongodb.com/atlas** → Create account
2. Create **Free Cluster** (M0 — 512MB free)
3. **Database Access** → Add user → username + password
4. **Network Access** → Add IP → `0.0.0.0/0` (allow all)
5. **Connect** → **Drivers** → Copy connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vedaai
```

---

### Step 3 — Upstash Redis (Already have it)

From Upstash dashboard, copy the `rediss://` URL:
```
rediss://default:YOUR_PASSWORD@mutual-sponge-xxxxx.upstash.io:6379
```

---

### Step 4 — Groq API Key (Already have it)

From https://console.groq.com → API Keys → your key:
```
gsk_xxxxxxxxxxxxxxxxxxxx
```

---

### Step 5 — Deploy Backend on Render

1. Go to **https://render.com** → Sign up with GitHub

2. Click **New → Web Service**

3. Connect your GitHub repo

4. Configure:
```
Name:             vedaai-backend
Root Directory:   apps/backend
Runtime:          Node
Build Command:    npm install && npm run build
Start Command:    node dist/index.js
Instance Type:    Free
```

5. Add **Environment Variables**:
```
NODE_ENV          = production
PORT              = 5000
MONGODB_URI       = mongodb+srv://user:pass@cluster.mongodb.net/vedaai
REDIS_URL         = rediss://default:pass@endpoint.upstash.io:6379
GROQ_API_KEY      = gsk_your_key
FRONTEND_URL      = https://your-app.vercel.app
MAX_FILE_SIZE_MB  = 10
UPLOAD_DIR        = uploads
```

6. Click **Create Web Service**

7. Wait for deploy — URL will be:
```
https://vedaai-backend.onrender.com
```

8. Test:
```
https://vedaai-backend.onrender.com/health
```

---

### Step 6 — Deploy Worker on Render

Worker needs a separate service:

1. **New → Web Service** (again)

2. Configure:
```
Name:             vedaai-worker
Root Directory:   apps/backend
Runtime:          Node
Build Command:    npm install && npm run build
Start Command:    node dist/queues/assignment.worker.js
Instance Type:    Free
```

3. Add **same Environment Variables** as backend

4. Click **Create Web Service**

---

### Step 7 — Deploy Frontend on Vercel

1. Go to **https://vercel.com** → Sign up with GitHub

2. Click **New Project** → Import your repo

3. Configure:
```
Framework Preset:  Next.js
Root Directory:    apps/frontend
Build Command:     npm run build
Output Directory:  .next
Install Command:   npm install
```

4. Add **Environment Variables**:
```
NEXT_PUBLIC_API_URL = https://vedaai-backend.onrender.com/api
NEXT_PUBLIC_WS_URL  = wss://vedaai-backend.onrender.com/ws
```

Note: `wss://` (secure WebSocket) for production

5. Click **Deploy**

6. URL will be:
```
https://vedaai.vercel.app
```

---

### Step 8 — Update Backend CORS

After Vercel gives you the URL, update Render backend env:
```
FRONTEND_URL = https://vedaai.vercel.app
```

Trigger a redeploy on Render.

---

### Step 9 — Verify Production

```bash
# Backend health
curl https://vedaai-backend.onrender.com/health

# Create test assignment
curl -X POST https://vedaai-backend.onrender.com/api/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "subject": "Science",
    "grade": "Grade 8",
    "topic": "Atoms",
    "dueDate": "2026-12-31T23:59:59.000Z",
    "questionConfigs": [{"type":"mcq","count":3,"marksPerQuestion":1}]
  }'
```

---

### ⚠️ Important Production Notes

| Issue | Solution |
|-------|----------|
| Render free tier sleeps after 15min inactivity | First request will be slow (~30s). Consider upgrading or using UptimeRobot to ping every 14 min |
| PDF files lost on Render restart | Render free tier has ephemeral storage. PDFs are regenerated on-demand — this is handled in the code |
| Worker and Backend must be separate services | They share the same codebase but different start commands |
| WebSocket on production | Must use `wss://` not `ws://` — already handled via env variable |
| Redis free tier limits | Upstash free: 10k commands/day. The code has graceful fallback if Redis fails |

---

## 🐛 Known Issues & Solutions

### Redis `ECONNRESET` errors in console
**Not a bug** — Upstash free tier drops idle TCP connections. The code auto-reconnects. Generation works via DB polling fallback.

### Worker not picking up jobs
**Solution:** Check that worker terminal shows `✅ DB Polling Fallback started`. If not, restart worker:
```bash
cd apps/backend && npm run worker
```

### PDF download fails
**Solution:** Check that `uploads/papers/` directory exists and backend has write permission.

### WebSocket not connecting
**Solution:** Ensure backend is running on port 5000 and `NEXT_PUBLIC_WS_URL` is correct.

---

## 📝 Scripts Reference

### Backend
```bash
npm run dev      # Start API server with hot reload
npm run worker   # Start BullMQ worker with hot reload
npm run build    # Compile TypeScript to dist/
npm start        # Start compiled API server
```

### Frontend
```bash
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 👨‍💻 Author

**Sumit** — Full Stack Engineer  
Built for VedaAI Hiring Assignment

---

## 📄 License

MIT License — feel free to use this project as a reference.