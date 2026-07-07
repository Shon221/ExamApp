# Exam Management System — React Client

Frontend client for a full-stack exam management system. Uses **OOP (classes)** for all non-component code: domain entities, configuration, logging, storage, notifications, mock API, and authentication.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Demo Accounts

| Role    | Email             | Password    |
|---------|-------------------|-------------|
| Teacher | teacher@exam.com  | teacher123  |
| Student | student@exam.com  | student123  |

## Features

- **Auth**: Login, Register, session persistence (`StorageService`)
- **Teacher**: Dashboard, exam CRUD, question editor, publish exams, grade submissions
- **Student**: Dashboard, browse published exams, take exam with auto-save, view grades
- **Navigation**: Role-based `NavigationMenu`
- **Services**: `ConfigService`, `LoggerService`, `StorageService`, `NotifyService`, `MockApiService`, `AuthService`

## Project Structure

```
src/
├── entities/          # OOP domain models (User, Exam, Question, Submission)
├── services/          # OOP singleton services
├── hooks/             # React hooks bridging services to UI
├── components/        # Reusable UI (layout, notifications)
├── pages/             # Route pages (auth, teacher, student)
└── routes/            # React Router configuration
docs/
└── DIAGRAMS.md        # Component hierarchy, UML, entities, use cases
```

## Diagrams

See [docs/DIAGRAMS.md](docs/DIAGRAMS.md) for:

- Components Hierarchy
- Use Case Diagram
- Entity / DB mock class diagram
- Services UML
- Sequence & layer architecture

## Configuration

Optional `.env`:

```env
VITE_APP_NAME=Exam Management System
VITE_MOCK_DELAY_MS=300
```

## Next Steps (Backend Integration)

Replace `MockApiService` calls with real HTTP client pointing to `VITE_API_BASE_URL`. Entity classes and view models can remain unchanged.
