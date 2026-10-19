# Ideologist 🚀
> **Tagline:** *From an idea to an opportunity.*  
> **Academic Demonstration Project:** 
> **Status:** Production-Grade, Tested & Fully Functional

---

## 🌟 1. Project Overview

**Ideologist** is an end-to-end web platform where aspiring entrepreneurs validate business ideas through transparent data-driven calculations, upload pitch decks, explore location feasibility, interact in a Virtual Shark Tank pitching room, and connect with prospective investors.

Unlike static prototypes or mock portfolios, **every feature in Ideologist is fully functional**:
- Real **SQLite persistent database** with Write-Ahead Logging (`WAL`) and foreign keys.
- Real **JWT authentication** and **bcrypt** password hashing with role-based authorization (`entrepreneur`, `investor`, `admin`).
- Real **Multer file uploads** for pitch decks (PDF, PPT, PPTX, DOC, DOCX up to 10MB) stored on disk with an in-browser PDF viewer.
- Real **transparent rules-based scoring engine** that calculates monthly profit, margin %, break-even months, and a 0–100 viability score with verifiable mathematical formulas.
- Real **OpenStreetMap geospatial embeds** without paid API keys.
- Real **Virtual Shark Tank** pitching session arena with session slotting, live status toggle, and an interactive Q&A floor.

---

## 🛠️ 2. Technology Architecture & Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend SPA** | React 18 + Vite | Fast client-side rendering & component reactivity |
| **Styling** | Tailwind CSS + Custom CSS | Glassmorphism, deep midnight navy design system |
| **Routing** | React Router DOM v6 | Protected role-based routes and public catalog |
| **Backend Server** | Node.js + Express.js | REST API, streaming file server & authentication |
| **Database** | SQLite3 (`node:sqlite` / `better-sqlite3`) | Persistent local relational database with zero daemon setup |
| **Authentication**| JWT + bcryptjs | Salting, password hashing, and role verification |
| **Document Vault**| Multer | Secure pitch deck upload, sanitization, and streaming |
| **Data Analytics**| Recharts | Financial breakdown charts and cashflow comparison |
| **Icons** | Lucide React | Modern iconography |
| **Maps & Location**| OpenStreetMap (OSM) | Free geospatial embeds without external paid API keys |

---

## 🚀 3. Quick Start Guide (Windows PowerShell)

Ensure you have **Node.js (v18+)** installed on your system.

### Step 1: Open Windows PowerShell in the Project Directory
```powershell
cd "C:\Users\ADITH RAGUNATH\.gemini\antigravity\scratch\ideologist"
```

### Step 2: Install Dependencies
Install dependencies for root, backend, and frontend (only needed once):
```powershell
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Seed the Database with Realistic Demo Data
Populate the SQLite database with 1 Admin, 2 Entrepreneurs, 2 Investors, 8 Realistic Startups across multiple sectors, pitch documents, and Shark Tank events:
```powershell
npm run seed
```

### Step 4: Run the Full Platform Concurrently
Start both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) with a single command:
```powershell
npm run dev
```

Open your browser at:  
👉 **`http://localhost:5173`**

---

## 🔑 4. Local Demonstration Accounts

The platform includes built-in **1-click evaluation buttons** on the `/login` page so professors and evaluators can switch roles instantly without manual typing:

| Role | Email Address | Password | Focus Area / Persona |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin@ideologist.com` | `Admin123!` | Platform reviewer, submission auditor, Shark Tank host |
| 🚀 **Entrepreneur 1**| `founder1@ideologist.com` | `Password123!` | Aarav Sharma (VoltGrid Mobility, MedPulse Diagnostics) |
| 🚀 **Entrepreneur 2**| `founder2@ideologist.com` | `Password123!` | Priya Patel (KisanSetu Direct, EcoPack Solutions) |
| 💼 **Investor 1** | `investor1@ideologist.com` | `Password123!` | Vikramaditya Singhania (Apex Angel Syndicate) |
| 💼 **Investor 2** | `investor2@ideologist.com` | `Password123!` | Ananya Deshmukh (Bharat Seed Ventures) |

---

## 🧪 5. Automated Tests Execution

To run the built-in automated test suite verifying mathematical edge cases, zero-division prevention, database persistence, and role guards:
```powershell
npm test
```
*Expected Output: `9 Passed, 0 Failed`.*

---

## 🎬 6. The 4-Act Viva Presentation Walkthrough

Follow this 5-minute script to demonstrate the complete full-stack workflow to your professors:

### Act 1 — The Founder (Entrepreneur)
1. Navigate to `/login` and click **"Founder"** (logs in as `founder1@ideologist.com`).
2. Show the **Founder Dashboard** metrics: Total ideas, catalog impressions, and investor inquiries.
3. Click **"Submit Idea"** (`/entrepreneur/create`).
4. Type in financial numbers: show how the **Live Viability Gauge** dynamically recalculates profit margins and break-even months as you change values!
5. Attach a pitch deck file and click **"Save as Draft"** or **"Submit for Admin Review"**.

### Act 2 — The Administrator
1. Sign out and click **"Admin"** on the login page (`admin@ideologist.com`).
2. Navigate to **"Review Submissions"** (`/admin/submissions`).
3. Open the pending submission (`SaaSFlow Multi-Cloud Ops`).
4. Inspect the startup details and click **"Approve & Publish to Marketplace"**.
5. Show the **Audit Trail** (`/admin/audit-logs`) to demonstrate persistent admin governance.

### Act 3 — The Investor
1. Sign out and click **"Investor"** on the login page (`investor1@ideologist.com`).
2. Go to **"Discover Startups"** (`/discover`), filter by Industry (`EV Charging`) or City (`Pune`).
3. Click on **VoltGrid Mobility**:
   - Inspect the **PDF Pitch Deck** directly in the browser modal viewer!
   - Review the **Financial Feasibility Chart** and the mathematical breakdown table.
   - Inspect the **OpenStreetMap** city cluster embed.
   - Click **"Save Opportunity"** to add it to your watchlist.
   - Click **"Express Investor Interest"**, type an introductory message, and dispatch a meeting request.

### Act 4 — The Virtual Shark Tank
1. Navigate to **"Virtual Shark Tank"** (`/pitch-events`).
2. Click on the **"Live Demo"** session (*Bharat Seed Summit 2026*).
3. Show the slotted pitch order (Slot #1, Slot #2).
4. Go to the **Q&A Floor**: submit a due diligence question, and show how the founder can reply to answer investor queries in real time.

---

## 📚 7. Project Documentation

Comprehensive documentation is provided in the `/docs` directory:
- [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) — System objectives, scope, and software life cycle.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Multi-tier system architecture and Mermaid diagrams.
- [`docs/DATABASE.md`](docs/DATABASE.md) — Entity-Relationship (ER) diagram and data dictionary.
- [`docs/API.md`](docs/API.md) — Complete REST API endpoint reference with request/response schemas.
- [`docs/TESTING.md`](docs/TESTING.md) — Quality assurance test log and mathematical edge-case validation.
- [`docs/VIVA_GUIDE.md`](docs/VIVA_GUIDE.md) — 21+ likely professor viva questions with technical answers.

---

## ⚠️ Academic Demonstration Notice
*Ideologist is developed for academic project demonstration. All financial projections, viability scores, and investor interaction requests are simulated demonstration features designed for educational evaluation and examination defense.*
