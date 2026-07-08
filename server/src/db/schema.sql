-- ============================================================================
-- ExamApp — PostgreSQL Schema
-- ============================================================================
-- This schema defines all tables for the ExamApp system.
-- It is based on:
--   - The existing mockData.js (server/src/data/mockData.js)
--   - The ERD in DIAGRAMS.md (Section 3)
--   - The validation schemas (server/src/middleware/validation.js)
--   - The actual field usage in controllers and services
--
-- NOTE: PostgreSQL is now the primary data source. mockData.js is preserved only as legacy reference data.
--
-- To apply this schema, run it against your PostgreSQL database using psql
-- or the project script:
--   npm run db:schema
-- ============================================================================

-- ─── Users ──────────────────────────────────────────────────────────────────
-- Matches: mockData.users
-- Fields from code: id, name, email, password, role (lecturer|student), created_at
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('lecturer', 'student')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Exams ──────────────────────────────────────────────────────────────────
-- Matches: mockData.exams
-- Fields from code: id, title, instructions, lecturer_id, status, 
--                   duration_minutes, passing_score, created_at, updated_at
-- Note: The mockDB also stores a 'questions' array of IDs on the exam object,
--       but in PostgreSQL this relationship is handled via the questions table FK.
CREATE TABLE IF NOT EXISTS exams (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(200) NOT NULL,
    instructions        TEXT DEFAULT '',
    lecturer_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    duration_minutes    INTEGER NOT NULL,
    passing_score       INTEGER NOT NULL CHECK (passing_score >= 0 AND passing_score <= 100),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Questions ──────────────────────────────────────────────────────────────
-- Matches: mockData.questions
-- Fields from code: id, exam_id, type, text, options[], correct_answer, order, points
-- Note: 'options' is stored as TEXT[] (PostgreSQL array) to match the JS string array.
--       'type' includes 'short-answer' (from validation.js) in addition to ERD types.
CREATE TABLE IF NOT EXISTS questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id         UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN ('multiple-choice', 'true-false', 'short-answer')),
    text            TEXT NOT NULL,
    options         TEXT[] DEFAULT '{}',
    correct_answer  TEXT NOT NULL,
    "order"         INTEGER NOT NULL,
    points          INTEGER NOT NULL CHECK (points >= 1),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Submissions ────────────────────────────────────────────────────────────
-- Matches: mockData.submissions
-- Fields from code: id, exam_id, student_id, score, total_points_earned,
--                   total_possible_points, status, submitted_at, time_spent_minutes
-- Note: In mockDB, 'answers' is an embedded array. In PostgreSQL, answers are
--       normalized into the submission_answers table below.
CREATE TABLE IF NOT EXISTS submissions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id                 UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score                   INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    total_points_earned     INTEGER DEFAULT 0,
    total_possible_points   INTEGER DEFAULT 0,
    status                  VARCHAR(20) NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'submitted', 'graded')),
    submitted_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_spent_minutes      INTEGER DEFAULT 0
);

-- ─── Submission Answers ─────────────────────────────────────────────────────
-- Matches: the embedded answers[] array inside mockData.submissions
-- Fields from code: question_id, answer, is_correct, points_earned,
--                   feedback, graded_by, graded_at
-- These fields are used by submissionService.gradeAnswer()
CREATE TABLE IF NOT EXISTS submission_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer          TEXT DEFAULT '',
    is_correct      BOOLEAN DEFAULT FALSE,
    points_earned   INTEGER DEFAULT 0,
    feedback        TEXT DEFAULT '',
    graded_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    graded_at       TIMESTAMP
);

-- ─── Drafts ─────────────────────────────────────────────────────────────────
-- Matches: mockData.drafts
-- Fields from code: id, student_id, exam_id, answers (flexible structure), updated_at
-- Note: 'answers' is stored as JSONB because drafts hold an arbitrary array
--       of { question_id, answer } objects (same structure as the JS code).
-- UNIQUE constraint ensures one draft per student per exam (matches saveDraft logic).
CREATE TABLE IF NOT EXISTS drafts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id         UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    answers         JSONB DEFAULT '[]',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, exam_id)
);

-- ─── Refresh Tokens ─────────────────────────────────────────────────────────
-- Matches: mockData.refreshTokens
-- Fields from code: id, token, userId, created_at
-- Used by authService.generateRefreshToken / verifyRefreshToken / revokeRefreshToken
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token           TEXT NOT NULL UNIQUE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
-- Performance indexes for common query patterns used in the existing services
CREATE INDEX IF NOT EXISTS idx_exams_lecturer_id ON exams(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_exam_id ON submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submission_answers_submission_id ON submission_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_drafts_student_exam ON drafts(student_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
