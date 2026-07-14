# ExamApp — Full-Stack Exam Management System

A full-stack web application for managing academic exams. Lecturers create, edit, and publish exams; students take published exams, save drafts, and submit answers for automatic and manual grading. Built with a React frontend, a Node.js/Express backend, and a PostgreSQL database.

---

## Main Features

### Lecturer

- Log in with a lecturer account
- Dashboard with exam overview
- Create new exams (title, instructions, duration, passing score)
- Edit existing exams
- Delete exams
- Change exam status (draft, published, archived)
- Add, edit, and delete questions (multiple-choice, true/false, short-answer)
- View all student submissions across exams
- View submissions for a specific exam
- Manually grade individual answers (points and feedback)

### Student

- Register a new account
- Log in with a student account
- Dashboard with quick links
- Browse all published exams
- Take an exam with a question-by-question interface
- Save and restore answer drafts (auto-save)
- Submit a completed exam
- View submission history and grades
- Review a graded submission with per-question feedback

---

## Technology Stack

### Frontend

- **React 19** — UI framework
- **Vite 8** — build tool and dev server
- **React Router 7** — client-side routing
- **JavaScript (ES Modules)** — application logic
- **CSS** — styling (no CSS framework)

### Backend

- **Node.js** — runtime
- **Express 4** — HTTP framework
- **PostgreSQL** — relational database (`pg` driver)
- **bcrypt** — password hashing
- **jsonwebtoken** — JWT access and refresh tokens
- **cookie-parser** — HTTP cookie parsing
- **Joi** — request body validation
- **xss** — input sanitization
- **helmet** — security headers
- **express-rate-limit** — rate limiting on auth endpoints
- **cors** — cross-origin resource sharing
- **uuid** — unique ID generation
- **dotenv** — environment variable loading
- **nodemon** — development auto-restart (dev dependency)

---

## Project Structure

```
ExamApp/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # NotificationToast
│   │   │   ├── layout/         # AppLayout, NavigationMenu, ProtectedRoute
│   │   │   ├── student/        # ExamResults
│   │   │   └── teacher/        # ExamQuestions
│   │   ├── entities/           # Domain models (User, Exam, Question, Submission)
│   │   ├── hooks/              # React hooks (useAuth, useNotifications)
│   │   ├── pages/              # Route pages
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── student/        # Dashboard, Exams, TakeExam, Grades, SubmissionReview
│   │   │   └── teacher/        # Dashboard, Exams, ExamEditor, Submissions
│   │   ├── routes/             # AppRoutes (React Router configuration)
│   │   └── services/           # OOP singleton services
│   │       ├── ApiClient.js        # Generic fetch-based HTTP client
│   │       ├── AuthService.js      # Authentication state management
│   │       ├── BackendApiService.js # API calls to the Express server
│   │       ├── ConfigService.js    # App configuration
│   │       ├── LoggerService.js    # Console logging
│   │       ├── NotifyService.js    # Toast notifications
│   │       ├── StorageService.js   # localStorage wrapper
│   │       ├── ValidationService.js # Client-side form validation
│   │       ├── MockApiService.js   # Legacy mock API (not active)
│   │       └── MockDatabase.js     # Legacy mock database (not active)
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js/Express backend
│   ├── src/
│   │   ├── config/             # Environment variable loader (env.js)
│   │   ├── controllers/        # Route handlers (auth, exam, question, student, lecturer)
│   │   ├── data/               # Legacy mock data (used by seed scripts only)
│   │   ├── db/                 # SQL schema and migrations
│   │   ├── middleware/         # auth (JWT + roles), validation (Joi + XSS), errorHandler
│   │   ├── repositories/      # PostgreSQL query layer
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Business logic (auth, exam, submission, idGenerator)
│   │   └── utils/              # logger, responseHandler
│   ├── scripts/                # Database seed and migration scripts
│   ├── server.js               # Entry point
│   ├── .env.example
│   └── package.json
│
├── DIAGRAMS.md                 # Architecture diagrams (Mermaid)
└── README.md
```

---

## Demo Accounts

The seed script (`npm run db:seed:auth` in the server directory) creates two demo users. Both passwords are `123456`.

| Role     | Email                  | Password |
|----------|------------------------|----------|
| Lecturer | lecturer@example.com   | 123456   |
| Student  | student@example.com    | 123456   |

---

## Local Installation

### Prerequisites

- **Node.js** (v18 or later recommended)
- **PostgreSQL** (v14 or later recommended)

### 1. Clone the repository

```bash
git clone https://github.com/Shon221/ExamApp.git
cd ExamApp
```

### 2. Install client dependencies

```bash
cd client
npm install
```

### 3. Install server dependencies

```bash
cd ../server
npm install
```

### 4. Configure server environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Edit `server/.env` with your PostgreSQL connection string and JWT secrets (see [Environment Variables](#environment-variables) below).

### 5. Configure client environment variables

```bash
cd ../client
cp .env.example .env
```

For local development, set:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 6. Initialize the PostgreSQL database

From the `server/` directory:

```bash
npm run db:schema
```

This creates all tables, indexes, and triggers. The script is idempotent and safe to run more than once.

### 7. Seed demo data (optional)

```bash
npm run db:seed:auth
npm run db:seed:exams
npm run db:seed:questions
```

### 8. Start the server

```bash
npm run dev
```

The server starts on `http://localhost:3000` by default.

### 9. Start the client

In a separate terminal, from the `client/` directory:

```bash
npm run dev
```

The client starts on `http://localhost:5173` by default.

---

## Environment Variables

### Server (`server/.env`)

| Variable                 | Description                              | Example / Default           |
|--------------------------|------------------------------------------|-----------------------------|
| `DATABASE_URL`           | PostgreSQL connection string             | `postgresql://user:password@localhost:5432/examapp` |
| `DATABASE_SSL`           | SSL mode for the database connection     | `false` (local), auto-detected for remote |
| `JWT_ACCESS_SECRET`      | Secret key for signing access tokens     | *(required in production)*  |
| `JWT_REFRESH_SECRET`     | Secret key for signing refresh tokens    | *(required in production)*  |
| `JWT_EXPIRES_IN`         | Access token expiry duration             | `1h`                        |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry duration          | `7d`                        |
| `CLIENT_URL`             | Allowed CORS origin for the frontend     | `http://localhost:5173`     |
| `PORT`                   | Port the server listens on               | `3000`                      |
| `NODE_ENV`               | Environment mode                         | `development`               |

### Client (`client/.env`)

| Variable              | Description                              | Example / Default            |
|-----------------------|------------------------------------------|------------------------------|
| `VITE_API_BASE_URL`   | Base URL of the backend API              | `http://localhost:3000`      |
| `VITE_APP_NAME`       | Application display name                 | `Exam Management System`     |
| `VITE_MOCK_DELAY_MS`  | Simulated delay for legacy mock service  | `300`                        |

> **Do not commit real secrets or database connection strings to version control.**

---

## Database

PostgreSQL is the primary data source. The schema is defined in `server/src/db/schema.sql` and contains the following tables:

| Table                | Purpose                                         |
|----------------------|-------------------------------------------------|
| `users`              | Lecturer and student accounts (with hashed passwords) |
| `exams`              | Exam definitions (title, instructions, status, duration, passing score) |
| `questions`          | Questions belonging to exams (multiple-choice, true/false, short-answer) |
| `submissions`        | Student exam submissions with score and grading status |
| `submission_answers` | Individual answers per submission, with grading data and feedback |
| `drafts`             | In-progress answer drafts (one per student per exam, stored as JSONB) |
| `refresh_tokens`     | Active refresh tokens for session management |

The file `server/src/data/mockData.js` exists as a legacy reference. It is used only by the seed scripts to populate the database with initial demo data. The application itself reads and writes exclusively to PostgreSQL through the repository layer.

---

## Authentication

The application uses JWT-based authentication with HttpOnly cookies:

1. On login, the server generates an **access token** and a **refresh token**.
2. Both tokens are set as **HttpOnly, Secure (in production), SameSite** cookies — they are not accessible to frontend JavaScript.
3. The client sends cookies automatically via `credentials: 'include'` on every API request.
4. Protected routes on the server verify the access token from the cookie (with a fallback to the `Authorization` header).
5. When the access token expires, the client can call `/api/auth/refresh-token` to obtain a new one using the refresh token cookie.
6. On logout, both cookies are cleared and the refresh token is revoked in the database.
7. **Role-based authorization** is enforced on the server: lecturer-only routes reject students and vice versa.
8. The client stores only a non-sensitive user profile object in `localStorage` for UI state; authentication is controlled entirely by the server-side cookies.

---

## API Health Endpoints

| Method | Path              | Description                      | Auth Required |
|--------|-------------------|----------------------------------|---------------|
| GET    | `/api/health`     | Server status check              | No            |
| GET    | `/api/health/db`  | PostgreSQL connectivity check    | No            |

---

## Available Scripts

### Client (`client/`)

| Command            | Description                             |
|--------------------|-----------------------------------------|
| `npm run dev`      | Start Vite dev server (hot reload)      |
| `npm run build`    | Build production bundle                 |
| `npm run preview`  | Preview production build locally        |
| `npm run lint`     | Run ESLint                              |

### Server (`server/`)

| Command                    | Description                                       |
|----------------------------|---------------------------------------------------|
| `npm start`                | Start the server (`node server.js`)               |
| `npm run dev`              | Start with auto-restart (`nodemon server.js`)     |
| `npm run db:schema`        | Create/reset database tables from `schema.sql`    |
| `npm run db:migrate`       | Run incremental migrations                        |
| `npm run db:seed:auth`     | Seed demo user accounts                           |
| `npm run db:seed:exams`    | Seed demo exams                                   |
| `npm run db:seed:questions` | Seed demo questions                              |

---

## Deployment

The application is deployed on **Render**:

| Component  | Platform             | URL                                              |
|------------|----------------------|--------------------------------------------------|
| Client     | Render Static Site   | https://examapp-gk2z.onrender.com                |
| Server     | Render Web Service   | https://examapp-server-s4i4.onrender.com          |
| Database   | Render PostgreSQL    | *(managed by Render, not publicly accessible)*    |

### SPA Routing on Render

Because the React client uses client-side routing, a rewrite rule is required on the Render Static Site:

| Source | Destination | Action  |
|--------|-------------|---------|
| `/*`   | `/`         | Rewrite |

This ensures that all paths are served by `index.html` and handled by React Router.

---

## Documentation

The file `DIAGRAMS.md` in the project root contains Mermaid architecture diagrams:

1. **Components Hierarchy** — React component tree and module layout
2. **UML Class Diagram** — Client-side OOP service classes and relationships
3. **Entity Relationship Diagram** — Database tables and relationships
4. **Use Case Diagram** — Actions available to lecturers, students, and guests
5. **Authentication Flow** — Sequence diagram of the login process
6. **Exam Creation Flow** — Sequence diagram for creating an exam
7. **Application State Flow** — Auth state transitions
8. **Module Dependencies** — Dependency graph between frontend modules

> Note: Some diagrams in `DIAGRAMS.md` still reference `MockDBService` from an earlier phase of the project. The live application uses `BackendApiService` backed by the Express server and PostgreSQL.

---

## Security

The following security measures are implemented:

- **Password hashing** — bcrypt with salt rounds
- **JWT tokens in HttpOnly cookies** — tokens are not exposed to client-side JavaScript
- **Secure and SameSite cookie flags** — enabled in production to prevent CSRF
- **Helmet** — sets standard security HTTP headers
- **CORS** — restricted to the configured client origin
- **Rate limiting** — applied to authentication endpoints (login, register)
- **Input validation** — server-side Joi schemas on all mutating endpoints
- **XSS sanitization** — all validated string inputs are sanitized with the `xss` library
- **Role-based authorization** — middleware enforces lecturer/student access boundaries
- **Refresh token revocation** — tokens are stored in the database and deleted on logout

This provides a solid security foundation. As with any application, a full production deployment should also consider additional measures such as HTTPS enforcement, regular dependency audits, and logging/monitoring.

---

## Current Application Flow

1. **Lecturer creates an exam** — sets title, instructions, duration, and passing score (status: draft).
2. **Lecturer adds questions** — multiple-choice, true/false, or short-answer, each with a correct answer and point value.
3. **Lecturer publishes the exam** — changes status to "published", making it visible to students.
4. **Student browses published exams** — sees all available exams on the student exams page.
5. **Student takes the exam** — answers questions one by one; drafts are auto-saved to the server.
6. **Student submits the exam** — answers are sent to the server; multiple-choice and true/false questions are auto-graded.
7. **Lecturer reviews submissions** — views all submissions, manually grades short-answer questions, and adds per-question feedback.
8. **Student views results** — sees the overall score, per-question results, and lecturer feedback on the submission review page.
