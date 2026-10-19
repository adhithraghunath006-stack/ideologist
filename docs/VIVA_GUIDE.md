# Ideologist — Comprehensive Viva & Academic Defense Guide

This guide is prepared for students defending **Ideologist** in practical examinations, mini-project reviews, and external vivas. It contains 21 direct questions with technically precise, simple answers.

---

### Q1: What is Ideologist and what is its primary technical objective?
**Answer:**  
Ideologist is a full-stack web platform designed to validate early-stage startup business ideas and bridge founders with angel investors. Its primary technical objective is replacing subjective startup feedback with a **deterministic, transparent financial viability engine** that calculates unit margins, break-even velocity, and a weighted 0–100 viability score, while offering local pitch deck document management and an interactive Virtual Shark Tank pitching room.

---

### Q2: Why did you choose React with Vite for the frontend?
**Answer:**  
Vite uses native ES modules (`ESM`) during development, offering near-instant hot module replacement (HMR) and sub-second startup times compared to legacy Webpack. React 18 allows a modular, component-driven UI architecture, enabling components like the `ViabilityMeter`, `FinancialBreakdownChart`, and `IdeaCard` to re-render reactively without full page reloads.

---

### Q3: Why did you choose SQLite instead of MongoDB or MySQL?
**Answer:**  
1. **Self-Contained & Zero Server Setup:** SQLite runs embedded inside the Node.js process using native `node:sqlite`, eliminating the requirement to install or manage separate database servers (e.g. MySQL daemon or MongoDB instance) on the evaluator’s computer.
2. **ACID Compliance & Relational Integrity:** Business investments, applications, and pitch documents inherently possess strict relational relationships that benefit from SQL foreign keys and cascade rules, which are harder to enforce natively in NoSQL.
3. **Portability:** The entire application database resides in a single, portable file (`database.sqlite`) that can be seeded, backed up, and inspected easily.

---

### Q4: How is SQLite configured for data persistence and concurrent access?
**Answer:**  
We enable two crucial PRAGMAs on database initialization:
```javascript
rawDb.exec('PRAGMA foreign_keys = ON;');
rawDb.exec('PRAGMA journal_mode = WAL;');
```
- `PRAGMA foreign_keys = ON;` enforces referential integrity so child records (e.g. documents or bookmarks) are automatically removed if a parent idea is deleted (`ON DELETE CASCADE`).
- `PRAGMA journal_mode = WAL;` (Write-Ahead Logging) permits concurrent readers while a write transaction is occurring, preventing database locking issues during simultaneous user interactions.

---

### Q5: Explain the Viability Scoring Formula in detail. How are the weights distributed?
**Answer:**  
The viability score is a deterministic weighted sum of 4 auditable pillars totaling 100%:
$$\text{Viability Score} = 0.35 \times \text{MarginScore} + 0.25 \times \text{BreakEvenScore} + 0.20 \times \text{FundingScore} + 0.20 \times \text{MarketScore}$$

1. **Profitability Margin (35%):**  
   $\text{Profit Margin} = \frac{\text{Monthly Revenue} - \text{Monthly Expenses}}{\text{Monthly Revenue}} \times 100$.  
   Margins $\ge 40\%$ receive 85–100 points; negative margins are penalized.
2. **Break-Even Velocity (25%):**  
   $\text{Break-Even Months} = \frac{\text{Startup Cost}}{\text{Monthly Net Profit}}$.  
   Ventures achieving break-even in $< 12$ months score up to 100 points.
3. **Funding Feasibility (20%):**  
   Evaluates whether the requested funding target covers startup capital and operational burn runway, verifying that equity offered is in a healthy seed dilution band (8%–22%).
4. **Market Dynamics (20%):**  
   $\text{Score} = (\text{Demand} \times 0.6) + ((100 - \text{Competition}) \times 0.4)$.

---

### Q6: How does the scoring engine prevent division by zero?
**Answer:**  
In `scoringEngine.js`, before calculating break-even months, the system checks whether `monthlyProfit > 0`. If `monthlyProfit <= 0` (e.g. zero profit or capital burn), the calculation does not divide by zero; it sets `breakEvenMonths = null` and assigns a low boundary score with an explicit warning label: *"Negative Cashflow / Break-even not reachable"*.

---

### Q7: How does authentication and password security work?
**Answer:**  
1. When a user registers, their raw password is never stored. We generate a cryptographic salt using `bcryptjs` and hash the password with 10 rounds of salting.
2. During login, `bcrypt.compare` verifies the entered string against the database hash.
3. Upon authentication, a JSON Web Token (JWT) is signed containing `{ id, email, role }` and returned to the client. Subsequent protected requests transmit this token via the `Authorization: Bearer <TOKEN>` HTTP header.

---

### Q8: How do you prevent users from making themselves administrators during registration?
**Answer:**  
We enforce this on the backend controller, not just in the frontend UI. In `authController.js`:
```javascript
if (role !== 'entrepreneur' && role !== 'investor') {
  return res.status(400).json({
    success: false,
    message: 'Invalid role selection. Only Entrepreneur and Investor roles can register publicly.'
  });
}
```
Even if an attacker sends a POST request with `{ "role": "admin" }` via curl or Postman, the backend forcefully rejects the request. The Administrator account is seeded strictly via the local `seed.js` script.

---

### Q9: Where are uploaded pitch decks stored and how are they protected?
**Answer:**  
Files are stored locally in the `backend/uploads/` directory on disk, while metadata (`file_name`, `original_name`, `file_size`, `file_type`) is recorded in the `pitch_documents` table in SQLite. Uploaded files are served via a controlled Express streaming endpoint (`/api/ideas/documents/:docId/download`) that verifies the document exists and sets safe content headers.

---

### Q10: How do you prevent path traversal attacks during file upload?
**Answer:**  
In `uploadMiddleware.js`, we do not use the user's raw submitted filename on the server filesystem. Instead, we sanitize the basename using a regex replacing non-alphanumeric characters with underscores, and append a high-entropy timestamp and random number:
```javascript
const ext = path.extname(file.originalname).toLowerCase();
const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
```
This guarantees filenames cannot contain `../` or manipulate file directories.

---

### Q11: How do you preview PDF pitch decks directly in the browser?
**Answer:**  
In the streaming route, when the requested file has a `.pdf` extension, the backend sets:
```javascript
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `inline; filename="${doc.original_name}"`);
```
The React frontend loads this URL inside a modal `<iframe>`, allowing native browser PDF rendering with zoom and page navigation. Other file types (e.g. `.docx`, `.pptx`) are served with `attachment` disposition for direct local download.

---

### Q12: How does the Location Engine work without paid Google Maps API keys?
**Answer:**  
We map each startup to a supported Indian economic cluster (`locationData.js`) providing Tier classification, operating cost index, and talent benchmarks. Geospatial visualization is achieved via **OpenStreetMap** iframe embeds using bounding box coordinates:
```javascript
mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=...&marker=...`;
```
This is free, open-source, and does not require paid billing accounts or external API tokens.

---

### Q13: How does the Virtual Shark Tank feature work? Is the video stream simulated?
**Answer:**  
The Virtual Shark Tank is engineered as an event session scheduling and live floor due diligence system. Admins schedule pitching events and slot approved startups. Investors attend the session, view scheduled pitches in order (Slot #1, Slot #2), and participate in a structured Q&A thread. The "Live Demo" status is controlled by an administrative toggle. We deliberately do not build complex WebRTC video streaming because that introduces heavy network latency and camera hardware dependencies during an academic viva.

---

### Q14: Explain the database relationship between Users, Ideas, and Pitch Documents.
**Answer:**  
- **Users to Ideas:** One-to-Many (`1:N`). One entrepreneur can create multiple startup submissions.
- **Ideas to Pitch Documents:** One-to-Many (`1:N`). An idea can have multiple attached pitch decks.
- **Investors to Saved Ideas:** Many-to-Many (`M:N`) implemented through the junction table `saved_ideas` with a `UNIQUE(investor_id, idea_id)` constraint.
- All foreign keys feature `ON DELETE CASCADE` to prevent orphaned records.

---

### Q15: What is the difference between client-side state and database persistence in your project?
**Answer:**  
Client-side state (such as active filter tabs, modals, and input fields) is maintained in React component state (`useState`) and context (`AuthContext`). All business entities—users, ideas, approval statuses, bookmarks, and Q&A messages—are persistently committed to the SQLite database file on disk, meaning data survives page refreshes and server restarts.

---

### Q16: How does Role-Based Access Control (RBAC) work across your endpoints?
**Answer:**  
We built reusable Express middleware:
```javascript
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
}
```
For example, only `admin` can access `/api/admin/*`, only `investor` can call `/api/investor/saved/toggle`, and only `entrepreneur` can invoke `/api/ideas` creation.

---

### Q17: What happens when an entrepreneur updates an idea that is already approved?
**Answer:**  
Only ideas in `Draft` or `Pending Review` status can be edited by a founder. Once an idea is `Published`, modification privileges are locked to preserve evaluation integrity and prevent founders from changing financials after investor interest has been registered.

---

### Q18: How does an investor express interest in a startup?
**Answer:**  
On the startup detail page, accredited investors can click *"Express Investor Interest"*, opening a modal to provide an introductory diligence note and proposed meeting window. The backend inserts a record into `investor_interests`, which immediately appears in the founder's Dashboard inbox where they can Accept or Decline and supply Google Meet coordinates.

---

### Q19: What automated testing did you perform?
**Answer:**  
We developed `backend/test.js` which verifies:
1. Positive cashflow break-even calculation.
2. Division-by-zero handling when revenue equals expenses.
3. Negative margin penalties during operational burn.
4. City benchmark lookups and cluster matching.
5. Password hashing and role assignments for seeded users.
6. Slotted startups in Shark Tank sessions.
All 9 automated unit tests pass with zero failures.

---

### Q20: What are the main limitations and future scope of this project?
**Answer:**  
- **Current Limitations:** Market demand and competition scores are currently input-based or benchmark-driven rather than scraping live corporate registrar filings.
- **Future Scope:** Integrating machine learning NLP to auto-parse uploaded PDF pitch decks and extract revenue numbers directly into the form fields.

---

### Q21: What is the exact sequence to present this project in a 5-minute Viva?
**Answer (The "4-Act Demo"):**
1. **Act 1 (Founder Journey):** Log in as `founder1@ideologist.com`, show the Founder Dashboard metrics, open the Idea Wizard, adjust monthly revenue to demonstrate the live real-time viability score updating, and show the attached pitch deck.
2. **Act 2 (Admin Moderation):** Log in as `admin@ideologist.com`, open *Review Submissions*, review the pending startup `SaaSFlow Multi-Cloud Ops`, inspect its pitch deck, approve it, and show the audit trail entry.
3. **Act 3 (Investor Marketplace):** Log in as `investor1@ideologist.com`, filter for EV Charging in Pune, open `VoltGrid Mobility`, open the PDF viewer modal, bookmark the startup, and send an interest inquiry.
4. **Act 4 (Virtual Shark Tank):** Navigate to `/pitch-events`, demonstrate the `Live Demo` session, show the slotted pitches, post a due diligence question, and view the founder's response.
