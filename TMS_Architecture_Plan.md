# 🏗️ Yellomind TMS — Architecture & Engineering Plan
### Tender Management System | Final Year Project (PFE)
> **Stack:** Next.js 16 · Express.js · PostgreSQL · Sequelize · OpenAI API

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Project State](#2-current-project-state)
3. [Proposed Improved System](#3-proposed-improved-system)
4. [Application Modules](#4-application-modules)
5. [System Architecture](#5-system-architecture)
6. [Database Design](#6-database-design)
7. [AI Integration](#7-ai-integration)
8. [End-to-End Workflow Scenario](#8-end-to-end-workflow-scenario)
9. [Setup Guide](#9-setup-guide)
10. [Jury Presentation Tips](#10-jury-presentation-tips)

---

## 1. Project Overview

### What is a Tender Management System?

A **Tender Management System (TMS)** is a digital platform that helps companies manage the full lifecycle of **calls for tenders** (appels d'offres) — from detecting new opportunities to submitting proposals and tracking results.

### The Business Problem

Without a TMS, companies face:
- Missed deadlines on tender opportunities
- Duplicated effort — rewriting proposals from scratch each time
- No visibility into win/loss rates or pipeline performance
- No structured way to reuse knowledge from past proposals
- Manual document handling prone to errors and non-compliance

### The Value of This Platform

**Yellomind TMS** transforms a fragmented, manual process into a structured, intelligent workflow:

| Without TMS | With Yellomind TMS |
|---|---|
| Scattered emails and files | Centralized tender pipeline |
| Manual proposal writing | AI-assisted content generation |
| No history or reuse | Knowledge base of past proposals |
| No performance metrics | Real-time dashboards & analytics |
| Risk of missing deadlines | Automated deadline tracking |

---

## 2. Current Project State

### What Exists (Based on Code Analysis)

After reviewing the actual repository, here is what is already implemented:

**Backend (`/backend`)**
- ✅ Express.js server with `helmet`, `cors`, `cookie-parser`, `rate-limiter`
- ✅ Sequelize ORM connected to PostgreSQL via `DATABASE_URL`
- ✅ JWT authentication (15-minute access token + 7-day refresh token via HttpOnly cookie)
- ✅ Role & Permission system (`Role`, `Permission`, `Session` models)
- ✅ `Utilisateur` model with bcrypt password hashing hooks
- ✅ `Client` model with full fields (`raison_sociale`, `secteur`, `email`, `telephone`, `pays`, etc.)
- ✅ `clientController.js` and `authController.js`
- ✅ Route structure under `/api`

**Frontend (`/frontend`)**
- ✅ Next.js 16 with App Router
- ✅ Login page with JWT flow → redirects to `/dashboard`
- ✅ `/clients` page: list, create, delete clients (full CRUD UI with Tailwind)
- ✅ `/dashboard` route exists (basic)
- ✅ Axios instance (`lib/api`) with token management
- ✅ `lucide-react`, `react-hot-toast` installed

### Current Weaknesses

| Area | Problem |
|---|---|
| **Backend files** | Corrupted/stray text files in `/backend` root (e.g., `async`, `await`, `const` as loose filenames — leftover from copy-paste errors) |
| **Missing modules** | No `Tender`, `Submission`, `Document`, `KnowledgeBase` models yet |
| **No AI layer** | Zero AI integration currently |
| **Frontend** | Only 2 routes (`/` login, `/clients`). Dashboard is empty |
| **No service layer** | Business logic lives directly in controllers (not scalable) |
| **No file upload** | No PDF/document handling yet |
| **Auth gap** | Frontend stores token in `localStorage` (XSS risk — should use httpOnly cookie already set by backend) |
| **No error boundaries** | Frontend uses raw `alert()` for errors |
| **No testing** | Zero automated tests |

---

## 3. Proposed Improved System

### Vision: From Basic CRUD to Intelligent SaaS

The goal is to evolve the project from a simple data-entry tool into a **Decision Support System** for tender management.

### Three Pillars of Improvement

#### Pillar 1 — Solid Engineering Foundation
- Clean layered architecture: `Routes → Controllers → Services → Models`
- Centralized error handling middleware
- Request validation with `express-validator` or `joi`
- Proper file upload handling with `multer` + local/cloud storage
- Environment-based config management

#### Pillar 2 — Workflow Automation
- Tender status machine: `Detected → Qualified → In Progress → Submitted → Won/Lost`
- Deadline tracking with automated alerts
- Task assignment per tender (who does what)
- Document versioning (keep track of proposal drafts)

#### Pillar 3 — Knowledge Capitalization & AI
- Store all past proposals in a searchable **Knowledge Base**
- AI extracts requirements from uploaded tender PDFs
- AI suggests relevant past proposals based on similarity
- AI generates draft proposal sections from tender requirements
- Compliance checker: AI cross-checks proposal against tender requirements

---

## 4. Application Modules

### Sidebar Navigation Structure

```
🏠 Dashboard
👥 Clients
📋 Tenders (Appels d'Offres)
📝 Submissions
📚 Knowledge Base
🤖 AI Assistant
📊 Reports & Analytics
⚙️  Settings
```

---

### 🏠 Dashboard

**Purpose:** Central command center — real-time overview of all activity.

**Features:**
- KPI cards: Active tenders, Submissions this month, Win rate %, Upcoming deadlines
- Pipeline chart: Tenders by status (Kanban-style visualization)
- Recent activity feed
- Deadline alerts (red if < 3 days)

**User Actions:**
- Click a KPI card → navigate to filtered list
- View upcoming deadlines at a glance
- See which tenders need urgent attention

---

### 👥 Clients

**Purpose:** Manage all client companies that issue tenders.

**Features (already partially built):**
- List all clients with search & filter by sector/country
- Create, edit, view, deactivate clients
- Client profile page: shows all tenders issued by that client
- Contact history notes

**User Actions:**
- Add a new client with company details
- View a client's tender history
- Mark a client as inactive (soft delete — already in model via `actif` field)

---

### 📋 Tenders (Appels d'Offres)

**Purpose:** Core module — track every tender opportunity from detection to closing.

**Features:**
- Tender list with status badges: `Détecté`, `Qualifié`, `En cours`, `Soumis`, `Gagné`, `Perdu`
- Tender detail page: description, deadline, budget estimate, linked client, documents
- Status transition buttons (workflow engine)
- Assign responsible team member
- Attach tender documents (PDF, Word)
- Deadline countdown timer

**User Actions:**
- Create a new tender linked to an existing client
- Upload the official tender document (cahier des charges)
- Change tender status as it progresses
- Assign a team lead to the tender

---

### 📝 Submissions

**Purpose:** Manage the preparation and submission of proposals.

**Features:**
- One submission per tender (or multiple versions/drafts)
- Submission sections: Executive Summary, Technical Proposal, Commercial Proposal, Appendices
- Status: `Brouillon`, `En révision`, `Finalisé`, `Soumis`
- AI content generation per section
- Document export (PDF)
- Result tracking: Won / Lost / Pending + feedback notes

**User Actions:**
- Create a submission draft for a tender
- Use AI to generate proposal sections
- Finalize and mark as submitted
- Record the result and lessons learned

---

### 📚 Knowledge Base

**Purpose:** Institutional memory — reuse the best content from past proposals.

**Features:**
- Repository of approved proposal sections, templates, and reference documents
- Searchable by keyword, sector, client, or tender type
- Tag system for easy retrieval
- "Reuse" button: inject a knowledge item into a new submission
- AI-powered semantic search (find similar content by meaning, not just keyword)

**User Actions:**
- Browse past proposal sections
- Search "IT security proposals" → get relevant past content
- Save a winning proposal section as a knowledge item
- Reuse a template in a new submission

---

### 🤖 AI Assistant

**Purpose:** Embedded AI copilot for proposal preparation.

**Features:**
- Upload tender PDF → AI extracts structured requirements list
- Generate proposal sections from requirements
- Compliance check: "Does my proposal address all requirements?"
- Summarize long tender documents
- Suggest similar past proposals from Knowledge Base
- Chat interface for free-form queries about the tender

**User Actions:**
- Upload tender PDF and trigger extraction
- Click "Generate Executive Summary" → AI writes a draft
- Run compliance check before submission
- Ask "What was our win rate for IT tenders in 2024?"

---

### 📊 Reports & Analytics

**Purpose:** Data-driven insights to improve strategy and performance.

**Features:**
- Win/Loss rate by client, sector, year
- Average time from detection to submission
- Tender volume over time (bar chart)
- Top performing team members
- Knowledge Base usage statistics
- Export reports as PDF or Excel

**User Actions:**
- Filter reports by date range, client, or sector
- Export a performance report for management
- Identify which sectors have the highest win rate

---

## 5. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│              Next.js 16 — App Router                    │
│         Pages · Components · Hooks · Axios              │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST API
                         │ (JWT Bearer Token)
┌────────────────────────▼────────────────────────────────┐
│                  BACKEND (Node.js)                       │
│              Express.js — Port 4000                     │
│                                                         │
│  Routes → Controllers → Services → Models               │
│                                                         │
│  Middleware: Auth · Validation · Rate Limit · Helmet    │
│  File Upload: Multer → /uploads                         │
│  AI Layer: OpenAI API client service                    │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
┌──────────▼──────────┐   ┌──────────▼──────────────────┐
│   PostgreSQL DB      │   │     OpenAI API              │
│   Port 5432         │   │   GPT-4o / GPT-4-turbo      │
│   Sequelize ORM     │   │   PDF text → AI response    │
│   DB: yellomind_tms │   └─────────────────────────────┘
└─────────────────────┘
```

### How the Stack Interacts

1. **Next.js (Frontend)** calls the Express REST API using `axios` with JWT Bearer token
2. **Express (Backend)** validates the token via middleware, then routes to the appropriate controller
3. **Controllers** delegate business logic to **Services** (pure functions, no HTTP knowledge)
4. **Services** interact with **Sequelize models** to query/mutate PostgreSQL
5. **AI Service** sends text to OpenAI API and returns structured JSON to the controller
6. **File uploads** are processed by `multer`, stored on disk, and text is extracted via `pdf-parse`

### Recommended Backend Folder Structure

```
backend/
├── app.js                  # Express app setup (middleware, routes)
├── config/
│   └── database.js         # Sequelize connection
├── models/
│   ├── index.js
│   ├── Client.js           ✅ exists
│   ├── Utilisateur.js      ✅ exists
│   ├── Role.js             ✅ exists
│   ├── Permission.js       ✅ exists
│   ├── Session.js          ✅ exists
│   ├── Tender.js           🔲 to create
│   ├── Submission.js       🔲 to create
│   └── Document.js         🔲 to create
├── controllers/
│   ├── authController.js   ✅ exists
│   ├── clientController.js ✅ exists
│   ├── tenderController.js 🔲 to create
│   └── aiController.js     🔲 to create
├── services/               # NEW layer — business logic
│   ├── aiService.js        🔲 OpenAI API calls
│   ├── pdfService.js       🔲 PDF text extraction
│   └── tenderService.js    🔲 Tender business logic
├── middlewares/
│   ├── auth.js             # JWT verification
│   └── validate.js         # Request validation
├── routes/
│   └── index.js            ✅ exists
└── uploads/                # Uploaded files
```

---

## 6. Database Design

### Conceptual Entity-Relationship Overview

**Utilisateur (User)**
- Has a `Role` (Admin, Manager, Contributor)
- A Role has many `Permissions`
- A User creates Sessions (refresh token management)

**Client**
- Represents a company that issues tenders
- One Client → Many Tenders (one-to-many)

**Tender (AppelOffre)**
- Belongs to one Client
- Has a status enum: `Detected → Qualified → InProgress → Submitted → Won/Lost`
- Has a deadline date and estimated budget
- One Tender → Many Documents
- One Tender → One or Many Submission drafts

**Submission**
- Belongs to one Tender
- Has sections: summary, technical, commercial
- Has a status (Draft → Review → Final → Submitted)
- Records the result (Won/Lost/Pending) after submission

**Document**
- Can belong to a Tender or a Submission
- Stores file path, original name, MIME type, upload date
- Types: `tender_spec`, `proposal_draft`, `final_proposal`, `reference`

**KnowledgeItem**
- Independent reusable proposal content
- Has tags, sector, title, content body
- Referenced by Submissions when content is reused

### Relationship Summary

```
Utilisateur ──belongs to──► Role ──has many──► Permission
Utilisateur ──has many────► Session

Client ──has many──────────► Tender
Tender ──has many──────────► Document
Tender ──has one───────────► Submission
Submission ──has many──────► Document
KnowledgeItem ◄──referenced by── Submission
```

---

## 7. AI Integration

### Where AI Is Used

| Module | AI Feature | Trigger |
|---|---|---|
| Tenders | PDF requirement extraction | User uploads tender PDF |
| Submissions | Proposal section generation | User clicks "Generate with AI" |
| Submissions | Compliance check | User clicks "Check Compliance" |
| AI Assistant | Document summarization | User uploads any document |
| Knowledge Base | Semantic search | User types search query |

### Data Flow: PDF Upload → AI → Structured Output

```
1. User uploads tender PDF via frontend
2. Frontend → POST /api/tenders/:id/analyze (multipart/form-data)
3. Backend (multer) saves file to /uploads/tenders/
4. pdfService.js extracts raw text using pdf-parse
5. aiService.js sends text to OpenAI GPT-4o
6. OpenAI returns structured JSON: { requirements: [...] }
7. Backend stores requirements in DB (JSONB field)
8. Frontend displays structured requirements list
```

### Proposal Generation Flow

```
User selects requirements → clicks "Generate Technical Proposal"
POST /api/submissions/:id/generate { section: 'technical', requirements: [...] }
aiService.js → OpenAI → returns markdown text
Frontend renders in rich text editor (user can edit before saving)
```

### Compliance Check Flow

```
User clicks "Check Compliance"
POST /api/submissions/:id/compliance-check
Backend fetches: tender requirements + submission content
aiService.js → OpenAI:
  "Compare proposal vs requirements. Return:
   { compliant: bool, missing: [...], warnings: [...] }"
Frontend shows: ✅ 18/22 addressed · ⚠️ 3 partial · ❌ 1 missing
```

### Key Libraries for AI Integration

```bash
npm install openai      # Official OpenAI Node.js client
npm install pdf-parse   # Extract text from PDF files
npm install multer      # Handle multipart file uploads
```

### Example AI Service

```javascript
// services/aiService.js
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.extractRequirements = async (pdfText) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a tender analysis expert. Return only valid JSON.' },
      { role: 'user', content: `Extract requirements from this tender:\n\n${pdfText}` }
    ],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(response.choices[0].message.content);
};

exports.generateProposalSection = async (section, requirements) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert proposal writer.' },
      { role: 'user', content: `Write a ${section} addressing:\n${requirements.join('\n')}` }
    ],
  });
  return response.choices[0].message.content;
};
```

---

## 8. End-to-End Workflow Scenario

> **Scenario:** A company detects a new IT services tender from a public client.

**Step 1 — Login**
User authenticates at `/`. JWT access token issued (15 min), refresh token in HttpOnly cookie. Redirected to `/dashboard`.

**Step 2 — Add / Verify Client**
Navigate to `/clients`. Check if the issuing organization exists. If not: click "+ Nouveau client", fill form, save.

**Step 3 — Create Tender**
Navigate to `/tenders` → "+ Nouveau appel d'offres". Link to client, set title, deadline, budget. Status auto-set to `Détecté`.

**Step 4 — Upload Tender Document**
On Tender detail page: upload the official PDF. Click "Analyser avec l'IA". Requirements list appears on screen (structured, editable).

**Step 5 — Qualify the Tender**
Review AI-extracted requirements. Click "Qualifier" → status changes to `Qualifié`. Assign a team lead.

**Step 6 — Create Submission & Generate Content**
Navigate to Submission tab → "Créer une soumission". Click "Générer avec l'IA" per section. AI writes drafts. Team reviews and edits.

**Step 7 — Run Compliance Check**
Click "Vérifier la conformité". AI compares proposal vs. requirements. Shows ✅ ⚠️ ❌ indicators. Team fixes gaps.

**Step 8 — Submit & Track**
Mark submission as `Soumis`. After result: click "Gagné" or "Perdu" + enter feedback notes. Winning sections saved to Knowledge Base. Dashboard KPIs update.

---

## 9. Setup Guide

### Prerequisites

- Node.js v18+ (https://nodejs.org)
- Git (already installed)
- Windows PowerShell or Terminal

---

### Step 1 — Install PostgreSQL (Windows)

**Option A: winget (recommended)**
```powershell
winget install PostgreSQL.PostgreSQL
```

**Option B: Chocolatey**
```powershell
choco install postgresql --params '/Password:postgres'
```

**Option C:** Download installer from https://www.postgresql.org/download/windows/
- Default port: `5432` | Remember the superuser password you set

---

### Step 2 — Create the Database

```powershell
psql -U postgres
```
Inside psql:
```sql
CREATE DATABASE yellomind_tms;
\q
```

---

### Step 3 — Configure Backend Environment

The `.env` file already exists at `/backend/.env`. Verify and update:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/yellomind_tms
JWT_SECRET=yellomind_secret_2025_tms_super_long_key
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Add for AI features:
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ Replace `YOUR_PASSWORD` with your PostgreSQL password.

---

### Step 4 — Install Backend Dependencies

```powershell
cd C:\Users\souha\Desktop\tms--project\backend
npm install
```

---

### Step 5 — Clean the Backend Root Directory

Stray files exist in `/backend` root (files named `async`, `await`, `const`, `try`, `{`, `}`, etc.). These are copy-paste artifacts and must be deleted manually via File Explorer or PowerShell:

```powershell
# Preview what to delete
cd C:\Users\souha\Desktop\tms--project\backend
Get-ChildItem -File | Where-Object { $_.Name -notmatch '\.' }
```

Delete all files that have no extension and have names like `async`, `await`, `const`, `try`, `cd`, `dialect`, `logging`, `require('dotenv').config()`, etc.

---

### Step 6 — Sync Database

```powershell
cd C:\Users\souha\Desktop\tms--project\backend
node -e "const { sequelize } = require('./models'); sequelize.sync({ alter: true }).then(() => { console.log('DB synced OK'); process.exit(0); })"
```

Create admin user:
```powershell
node seed.js
```

---

### Step 7 — Start the Backend

```powershell
cd C:\Users\souha\Desktop\tms--project\backend
npm run dev
```

Expected: `Serveur demarre sur le port 4000`

Test:
```powershell
curl http://localhost:4000/health
# Expected: {"status":"ok"}
```

---

### Step 8 — Install Frontend Dependencies

```powershell
cd C:\Users\souha\Desktop\tms--project\frontend
npm install
```

---

### Step 9 — Configure Frontend Environment

Create file `/frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

### Step 10 — Start the Frontend

```powershell
cd C:\Users\souha\Desktop\tms--project\frontend
npm run dev
```

Open browser: **http://localhost:3000**

---

### Quick-Start Checklist

```
[ ] PostgreSQL installed and running on port 5432
[ ] Database "yellomind_tms" created
[ ] /backend/.env configured with correct DB password
[ ] /backend npm install done
[ ] Stray junk files in /backend root deleted
[ ] Database synced (sequelize.sync or seed.js)
[ ] Backend running on port 4000
[ ] /frontend npm install done
[ ] /frontend/.env.local created
[ ] Frontend running on port 3000
[ ] Login works at http://localhost:3000
```

---

## 10. Jury Presentation Tips

### Key Technical Terms to Use

| Term | How It Applies to Your Project |
|---|---|
| **Decision Support System (DSS)** | AI + dashboards help managers decide which tenders to pursue |
| **Workflow Automation** | Automated status transitions, deadline alerts, task assignment |
| **Knowledge Capitalization** | Saving and reusing institutional knowledge from past proposals |
| **RAG (Retrieval-Augmented Generation)** | AI searches Knowledge Base before generating proposal content |
| **RBAC (Role-Based Access Control)** | Role + Permission system — already fully implemented |
| **JWT + Refresh Token Rotation** | Secure auth pattern — already implemented in your backend |
| **RESTful API** | Your Express backend follows REST conventions |
| **ORM (Sequelize)** | Object-Relational Mapping — already used with associations and hooks |

---

### UX/UI Improvements for Demo

- Add a **Kanban board** for tenders (status columns, drag-and-drop feel)
- Use **deadline countdown badges** (red < 3 days, orange < 7 days)
- Add **animated charts** in dashboard (Chart.js or Recharts)
- Replace all `alert()` calls with `react-hot-toast` (already installed)
- Use `lucide-react` icons throughout (already installed)

---

### 5-Minute Demo Script for Jury

1. **Login** → Show JWT auth, redirect to dashboard
2. **Dashboard** → Show KPI cards and pipeline chart — *"Management has instant visibility"*
3. **Add a Tender** → Create new tender linked to a client, upload PDF
4. **AI Extraction** → Click "Analyze with AI" → requirements appear structured on screen
   - *"The AI reads a 50-page document and extracts all requirements in seconds"*
5. **Generate Proposal** → Click "Generate with AI" for Technical section
   - *"Instead of starting from scratch, AI drafts a professional proposal"*
6. **Compliance Check** → Show ✅ ⚠️ ❌ report
   - *"Before submission, we verify the proposal addresses every requirement"*
7. **Submit & Track** → Mark submitted, show dashboard update
8. **Knowledge Base** → Show a saved past proposal section
   - *"Every winning proposal feeds our institutional memory"*

---

### What Makes This Jury-Level

- ✅ **Real-world problem** that every company managing tenders faces
- ✅ **AI is functional, not cosmetic** — extracts, generates, validates
- ✅ **Production-grade auth** — JWT refresh tokens, RBAC, rate limiting, Helmet
- ✅ **Clean Sequelize models** — hooks, associations, soft delete with `actif`
- ✅ **Knowledge Management** — demonstrates enterprise software thinking
- ✅ **Full-stack system** — real database, real API, real frontend, real AI

---

*Document generated: May 2026 | Yellomind TMS — PFE Architecture Plan*
