# Ideologist — Project Overview

> **Tagline:** *From an idea to an opportunity.*  
> **Type:** Academic  Mini-Project  
> **Stack:** React 18 (Vite), Express.js, SQLite (node:sqlite / better-sqlite3), Tailwind CSS, Recharts

---

## 1. Executive Summary

**Ideologist** is an end-to-end, full-stack startup idea validation and investor discovery platform designed to democratize access to entrepreneurship. Built specifically for students, first-time founders, and innovators from Tier-2 and Tier-3 ecosystems, Ideologist eliminates the ambiguity of early-stage venture creation by providing:

1. **Deterministic Viability Intelligence:** A transparent, rules-based financial evaluation engine that calculates net monthly margins, break-even velocity in months, and a weighted 0–100 viability score with verifiable mathematical formulas.
2. **Document & Pitch Deck Vault:** Multi-format document handling (PDF, PPT, PPTX, DOC, DOCX up to 10MB) allowing founders to attach pitch materials and investors to review them via an in-browser PDF viewer.
3. **Location Insights Engine:** Regional economic benchmarks, operational cost indices, and interactive OpenStreetMap embeds to evaluate market viability across major Indian tech and commercial clusters.
4. **Investor Marketplace & Watchlist:** Accredited investors can filter curated deals, bookmark opportunities, dispatch introductory diligence inquiries, and propose structured pitch meetings.
5. **Virtual Shark Tank Arena:** Scheduled pitching sessions with presentation slotting, simulated live demo controls, and a real-time floor Q&A thread between investors and founders.
6. **Administrative Governance:** A dedicated reviewer interface for pitch deck inspection, submission moderation (Approve/Reject with feedback), event scheduling, and user privilege controls backed by an SQLite audit log.

---

## 2. Problem Statement

Early-stage founders often struggle with:
- **Lack of Objective Validation:** Subjective opinions without unit economics benchmarks leading to premature failure.
- **Investor Access Asymmetry:** Founders outside primary metropolitan centers lack channels to showcase pitch decks to angel syndicates.
- **Opaque Valuation & Scoring:** Generic platforms rely on closed-source or simulated AI promises rather than auditable, understandable financial mathematics.

Ideologist solves this by providing an open, verifiable platform where calculations can be defended in front of academic examiners, pitch documents are securely served, and investor interactions follow a complete end-to-end workflow.

---

## 3. Core Functional Modules

```
                    +------------------------------------+
                    |             IDEOLOGIST             |
                    +------------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
+------------------+         +------------------+         +------------------+
|   ENTREPRENEUR   |         |     INVESTOR     |         |  ADMINISTRATOR   |
|     WORKSPACE    |         |    SYNDICATE     |         |    GOVERNANCE    |
+------------------+         +------------------+         +------------------+
| • Idea Wizard    |         | • Deal Discovery |         | • Vetting Queue  |
| • Live Scoring   |         | • Deck Viewer    |         | • Event Schedule |
| • Deck Upload    |         | • Saved Watchlist|         | • Slot Allocation|
| • Meeting Inbox  |         | • Direct Inquiries|        | • User Directory |
| • Shark Tank App |         | • Shark Tank Q&A |         | • Audit Trail    |
+------------------+         +------------------+         +------------------+
```

### Module A: Authentication & Role-Based Security
- Enforces strict backend authorization for `entrepreneur`, `investor`, and `admin`.
- Passwords salted and hashed with `bcryptjs` (cost factor 10).
- Public registration strictly restricts role to Entrepreneur or Investor. Admin accounts cannot be created via the public form and are provisioned via database seed scripts.

### Module B: Deterministic Viability Engine
- Evaluates four weighted pillars:
  1. **Profitability Margin (35%):** `(Monthly Profit / Monthly Revenue) * 100`
  2. **Break-Even Velocity (25%):** `Startup Cost / Monthly Net Profit`
  3. **Funding Feasibility (20%):** Valuation and runway buffer against equity ask (healthy range 8%–22%)
  4. **Market Dynamics (20%):** Weighted ratio of demand score vs competition index

### Module C: Location Intelligence
- Standardized economic benchmarks for 10 regional hubs (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Indore, Jaipur, Ahmedabad, Kochi, Coimbatore).
- Provides OpenStreetMap iframe embeds with zero paid external API dependencies.

### Module D: Virtual Shark Tank
- Scheduled pitch rounds with status states: `Upcoming`, `Live Demo`, and `Completed`.
- Founders apply with published ideas; Admins approve and assign presentation slot numbers.
- Integrated question and reply floor for simulated due diligence.

---

## 4. Software Development Life Cycle (SDLC)

Ideologist was developed following an **Agile Iterative Framework**:
1. **Requirements Engineering:** Definition of user personas, scoring formulas, and role workflows.
2. **Database Architecture:** Schema normalization, foreign key constraints, and WAL mode configuration.
3. **Backend API Engineering:** Modular Express architecture with dedicated controllers, routes, and middleware.
4. **Frontend UI/UX Design:** Dark navy glassmorphic design system using Tailwind CSS, Lucide icons, and Recharts.
5. **Quality Assurance & Verification:** Automated calculation testing, division-by-zero boundary testing, and end-to-end user journey validation.
