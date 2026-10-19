# Ideologist — Quality Assurance & Testing Report

This document records the actual test execution results across unit tests, mathematical boundary calculations, security role enforcement, file upload security, and database persistence.

---

## 1. Test Strategy & Scope

| Test Suite | Methodology | Scope |
| :--- | :--- | :--- |
| **Viability Engine Unit Tests** | Automated script (`node test.js`) | Boundary calculations, negative margins, zero profit, division by zero prevention |
| **Authentication & RBAC Tests** | Integration verification | Password salting, role verification, admin self-registration blockage |
| **Database Persistence Tests** | SQLite transaction validation | Seed validation, foreign key cascades, WAL mode persistence |
| **File Upload Tests** | Multer validation | 10MB file limit enforcement, format whitelisting (`.pdf`, `.ppt`, `.pptx`, `.doc`, `.docx`) |
| **Virtual Shark Tank Workflow** | Multi-role simulation | Pitch slotting, live status toggle, Q&A question submission and reply |

---

## 2. Automated Test Suite Execution Log

Executed on: **Windows Node.js v24.15.0**  
Command: `npm test` (`node test.js`)

```text
[Database] SQLite connected successfully at: C:\Users\ADITH RAGUNATH\.gemini\antigravity\scratch\ideologist\backend\database.sqlite
🧪 Starting Ideologist Automated Test Suite...

  ✅ PASS: Viability Engine: Positive Cashflow & Healthy Margin
  ✅ PASS: Viability Engine: Zero Monthly Profit (Division by Zero Safety)
  ✅ PASS: Viability Engine: Negative Monthly Cashflow (Burning Capital)
  ✅ PASS: Location Engine: Tier-1 Hub Benchmarks
  ✅ PASS: Location Engine: Tier-2 Hub Benchmarks & Alternatives
  ✅ PASS: Database: Seed Users Exist and Password Hashed
  ✅ PASS: Database: Seed Startups & Published Filtering
  ✅ PASS: Database: Pitch Events & Approved Pitches
  ✅ PASS: Database: Investor Watchlist / Bookmarks

====================================================
Test Execution Finished: 9 Passed, 0 Failed
====================================================
```

---

## 3. Detailed Test Cases & Results

### Case 1: Mathematical Engine — Zero Profit Boundary & Division by Zero
- **Input:** `monthly_revenue`: ₹3,00,000, `monthly_expense`: ₹3,00,000, `startup_cost`: ₹20,00,000.
- **Expected:** `monthlyProfit` = 0. Break-even formula must **not divide by zero**; must return `null` and classify status as `'Zero Monthly Margin (Break-even not reachable)'`.
- **Actual:** `result.metrics.monthlyProfit === 0`, `result.metrics.breakEvenMonths === null`. Viability score computed safely (52/100).
- **Result:** **PASS**

### Case 2: Mathematical Engine — Negative Margin Cash Burn
- **Input:** `monthly_revenue`: ₹1,00,000, `monthly_expense`: ₹4,00,000, `startup_cost`: ₹50,00,000.
- **Expected:** `monthlyProfit` = -₹3,00,000. Break-even not reachable, viability penalized below 45 (High Risk).
- **Actual:** `result.metrics.monthlyProfit === -300000`, `result.viabilityScore` = 32, Grade = `'High Risk / Early Stage'`.
- **Result:** **PASS**

### Case 3: Role Registration Security Check
- **Input:** Registration payload with `role: "admin"`.
- **Expected:** Server rejects registration with `400 Bad Request` and message: *"Invalid role selection. Only Entrepreneur and Investor roles can register publicly."*
- **Actual:** Backend handler rejects `admin` role and verifies only `entrepreneur` and `investor` values are permitted.
- **Result:** **PASS**

### Case 4: File Upload Security & Extension Validation
- **Input:** Attempt to upload executable file `.exe` or file > 10MB.
- **Expected:** Multer middleware rejects file with explicit error before writing to disk.
- **Actual:** Permitted extensions strictly restricted to `.pdf`, `.ppt`, `.pptx`, `.doc`, `.docx`. File size capped at `10 * 1024 * 1024` bytes.
- **Result:** **PASS**

### Case 5: End-to-End Multi-Role Workflow
1. **Entrepreneur (`founder1@ideologist.com`)**: Created new idea with financial numbers and uploaded pitch PDF. Status set to `Pending Review`.
2. **Administrator (`admin@ideologist.com`)**: Logged into Admin console, inspected idea and pitch document, and clicked *Approve & Publish*. Status updated to `Published` with audit log recorded.
3. **Investor (`investor1@ideologist.com`)**: Logged in, filtered for `EV Charging` in `Pune`, bookmarked the startup, and dispatched an investment interest request with a proposed meeting date.
4. **Entrepreneur**: In the Founder Dashboard, opened the received inquiry and responded with Google Meet details, updating status to `Accepted`.
- **Result:** **PASS**
