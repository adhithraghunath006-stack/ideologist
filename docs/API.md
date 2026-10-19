# Ideologist — REST API Specification

> **Base URL:** `http://localhost:5000/api`  
> **Data Format:** JSON / Multipart Form-Data (for uploads)  
> **Auth Header:** `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates an Entrepreneur or Investor account. (Admin registration is strictly prohibited).
- **Request Body:**
  ```json
  {
    "name": "Rohan Verma",
    "email": "rohan@startup.com",
    "password": "Password123!",
    "role": "entrepreneur",
    "city": "Bengaluru",
    "company": "NextGen Mobility",
    "bio": "Automotive engineer building fast chargers."
  }
  ```
- **Responses:**
  - `201 Created`: `{ "success": true, "token": "...", "user": { ... } }`
  - `400 Bad Request`: Email already registered or invalid role.

### `POST /auth/login`
Authenticates a user with email and password.
- **Request Body:**
  ```json
  {
    "email": "founder1@ideologist.com",
    "password": "Password123!"
  }
  ```
- **Responses:**
  - `200 OK`: `{ "success": true, "token": "...", "user": { ... } }`
  - `401 Unauthorized`: Invalid credentials.
  - `403 Forbidden`: Account suspended.

### `GET /auth/me`
Retrieves current authenticated session profile.
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response `200 OK`:** `{ "success": true, "user": { ... } }`

---

## 2. Startup Ideas & Discovery Endpoints

### `GET /ideas`
Public and investor startup catalog with filtering and search.
- **Query Parameters:**
  - `search`: Keyword string
  - `industry`: Sector name (e.g. `FinTech`, `CleanTech`)
  - `city`: City name (e.g. `Pune`, `Indore`)
  - `stage`: `Idea`, `Prototype`, `MVP`, `Early Traction`, `Scaling`
  - `minScore`: Minimum viability score (e.g. `70`)
  - `sortBy`: `newest`, `score_desc`, `funding_asc`, `funding_desc`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 6,
    "ideas": [
      {
        "id": 1,
        "title": "VoltGrid Mobility",
        "tagline": "...",
        "industry": "EV Charging",
        "funding_target": 7500000,
        "equity_offered": 12,
        "viability_score": 88,
        "is_saved": false
      }
    ]
  }
  ```

### `GET /ideas/:id`
Retrieves full details of a specific idea including attached documents, location profile, and complete financial analysis.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "idea": {
      "id": 1,
      "title": "VoltGrid Mobility",
      "problem": "...",
      "solution": "...",
      "analysis": {
        "viabilityScore": 88,
        "grade": "High Viability",
        "metrics": { ... },
        "breakdown": [ ... ],
        "recommendations": [ ... ]
      },
      "locationInsight": { ... },
      "documents": [ ... ]
    }
  }
  ```

### `POST /ideas/calculate`
Calculates instant, deterministic viability score without persisting to database (used for real-time wizard preview).
- **Request Body:**
  ```json
  {
    "startup_cost": 3000000,
    "monthly_revenue": 800000,
    "monthly_expense": 450000,
    "funding_target": 5000000,
    "equity_offered": 10,
    "demand_score": 85,
    "competition_score": 50,
    "target_city": "Pune",
    "industry": "EV Charging"
  }
  ```
- **Response `200 OK`:** `{ "success": true, "calculation": { ... } }`

### `POST /ideas`
Creates a new startup idea submission with optional pitch deck file attachment.
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `title`, `tagline`, `problem`, `solution`, `industry`, `stage`, `target_city`, `target_customer`, `funding_target`, `equity_offered`, `startup_cost`, `monthly_revenue`, `monthly_expense`, `demand_score`, `competition_score`, `status` (`Draft` or `Pending Review`).
- **File Field:** `pitch_deck` (optional file up to 10MB)
- **Response `201 Created`:** `{ "success": true, "idea": { ... } }`

### `GET /ideas/documents/:docId/download`
Streams the pitch deck document. PDFs are delivered inline for browser preview; office files are delivered as attachments.

---

## 3. Investor Relations Endpoints

### `POST /investor/saved/toggle`
Bookmarks or unbookmarks an idea.
- **Request Body:** `{ "idea_id": 1 }`
- **Response `200 OK`:** `{ "success": true, "saved": true, "message": "..." }`

### `GET /investor/saved`
Retrieves list of startups bookmarked by the authenticated investor.

### `POST /investor/interest`
Dispatches an investment interest note and meeting request to a founder.
- **Request Body:**
  ```json
  {
    "idea_id": 1,
    "message": "Apex syndicate would like to schedule a 30-minute founder diligence session.",
    "meeting_date": "Next Thursday, 3:00 PM IST"
  }
  ```
- **Response `201 Created`:** `{ "success": true, "message": "..." }`

### `GET /investor/received-interests`
Founder endpoint to view all investor inquiries received across their startups.

### `PUT /investor/interest/:id/respond`
Founder updates status (`Accepted` / `Declined`) and sends reply notes.

---

## 4. Virtual Shark Tank Endpoints

### `GET /pitch-events`
Lists all pitch sessions with status (`Upcoming`, `Live Demo`, `Completed`).

### `GET /pitch-events/:id`
Retrieves session details, slotted startup order, and Q&A threads.

### `POST /pitch-events/:id/apply`
Founder applies with their published startup.
- **Request Body:** `{ "idea_id": 1, "notes": "..." }`

### `POST /pitch-events/:id/questions`
Submits a question to a presenting founder on the Shark Tank floor.
- **Request Body:** `{ "idea_id": 1, "question": "..." }`

### `PUT /pitch-events/questions/:questionId/reply`
Founder posts official answer to a question.
- **Request Body:** `{ "reply": "..." }`

---

## 5. Administrative Endpoints

*(All routes under `/admin/*` require role `'admin'`)*

### `GET /admin/stats`
Summary platform statistics (user breakdown, ideas by status, events count, recent audits).

### `GET /admin/submissions`
List all startup submissions filtered by status (`Pending Review`, `Published`, `Rejected`, `All`).

### `PUT /admin/submissions/:id/review`
Approve or reject a submission.
- **Request Body:** `{ "status": "Published", "admin_feedback": "Approved for marketplace." }`

### `POST /admin/events`
Create a new Virtual Shark Tank session.

### `PUT /admin/events/:id/status`
Update session status (`Upcoming`, `Live Demo`, `Completed`).

### `PUT /admin/applications/:appId/review`
Approve founder application and assign pitch slot number (e.g. `1`, `2`, `3`).

### `GET /admin/users`
Search user registry with filters for role and account status.

### `PUT /admin/users/:id/toggle-status`
Toggle account between `active` and `suspended`.

### `GET /admin/audit-logs`
Retrieve administrative action log entries.
