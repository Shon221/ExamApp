# Exam Management System — Client Diagrams

## 1. Components Hierarchy

```mermaid
graph TD
    App[App]
    App --> AppRoutes[AppRoutes]
    AppRoutes --> LoginPage[LoginPage]
    AppRoutes --> RegisterPage[RegisterPage]
    AppRoutes --> ProtectedRoute[ProtectedRoute]
    ProtectedRoute --> AppLayout[AppLayout]
    AppLayout --> NavigationMenu[NavigationMenu]
    AppLayout --> NotificationToast[NotificationToast]
    AppLayout --> Outlet[Outlet / Pages]

    Outlet --> TeacherDashboard[TeacherDashboard]
    Outlet --> TeacherExamsPage[TeacherExamsPage]
    Outlet --> TeacherExamEditorPage[TeacherExamEditorPage]
    Outlet --> TeacherSubmissionsPage[TeacherSubmissionsPage]
    Outlet --> StudentDashboard[StudentDashboard]
    Outlet --> StudentExamsPage[StudentExamsPage]
    Outlet --> StudentTakeExamPage[StudentTakeExamPage]
    Outlet --> StudentGradesPage[StudentGradesPage]

    TeacherExamEditorPage --> QuestionEditorCard[QuestionEditorCard]
```

## 2. Use Case Diagram

```mermaid
flowchart LR
    Teacher((Teacher))
    Student((Student))
    System[Exam Client System]

    Teacher --> UC1[Login / Register]
    Student --> UC1
    Teacher --> UC2[Create & Edit Exams]
    Teacher --> UC3[Manage Questions]
    Teacher --> UC4[Publish Exams]
    Teacher --> UC5[Review Submissions]
    Teacher --> UC6[Grade & Publish Results]
    Student --> UC7[View Available Exams]
    Student --> UC8[Take Exam & Submit]
    Student --> UC9[View Grades & Feedback]

    UC1 --> System
    UC2 --> System
    UC3 --> System
    UC4 --> System
    UC5 --> System
    UC6 --> System
    UC7 --> System
    UC8 --> System
    UC9 --> System
```

## 3. Main Entities (Domain / DB Mock Views)

```mermaid
classDiagram
    class User {
        +string id
        +string email
        +string fullName
        +UserRole role
        +isTeacher() bool
        +isStudent() bool
        +toPublicView() object
    }

    class Exam {
        +string id
        +string title
        +string description
        +string teacherId
        +ExamStatus status
        +int durationMinutes
        +isPublished() bool
    }

    class Question {
        +string id
        +string examId
        +string text
        +QuestionType type
        +string[] options
        +int points
        +int order
    }

    class Submission {
        +string id
        +string examId
        +string studentId
        +IAnswerData[] answers
        +SubmissionStatus status
        +number score
        +string feedback
    }

    User "1" --> "*" Exam : creates
    Exam "1" --> "*" Question : contains
    Exam "1" --> "*" Submission : receives
    User "1" --> "*" Submission : submits
```

## 4. Services UML (OOP — Non-Component Layer)

```mermaid
classDiagram
    class ConfigService {
        -static instance
        -IAppConfig config
        +getInstance() ConfigService
        +get(key) value
        +getAll() IAppConfig
    }

    class LoggerService {
        -static instance
        -LogLevel minLevel
        +getInstance() LoggerService
        +debug(msg)
        +info(msg)
        +warn(msg)
        +error(msg)
    }

    class StorageService {
        -static instance
        +getInstance() StorageService
        +set(key, value)
        +get(key) T
        +setSession(value)
        +getSession() T
        +clearSession()
    }

    class NotifyService {
        -static instance
        -INotification[] notifications
        +getInstance() NotifyService
        +subscribe(listener)
        +success(msg)
        +error(msg)
        +dismiss(id)
    }

    class MockDatabase {
        -static instance
        +User[] users
        +Exam[] exams
        +Question[] questions
        +Submission[] submissions
        +getInstance() MockDatabase
        +reset()
    }

    class MockApiService {
        -MockDatabase db
        -ConfigService config
        -LoggerService logger
        +login(request)
        +register(request)
        +getExamsByTeacher(id)
        +getPublishedExams()
        +createExam(data)
        +publishExam(id)
        +gradeSubmission(id, score, feedback)
    }

    class AuthService {
        -MockApiService api
        -StorageService storage
        -SessionUser currentUser
        +login(request) SessionUser
        +register(request) SessionUser
        +logout()
        +getUser() SessionUser
    }

    MockApiService --> MockDatabase
    MockApiService --> ConfigService
    MockApiService --> LoggerService
    MockApiService --> NotifyService
    AuthService --> MockApiService
    AuthService --> StorageService
    AuthService --> LoggerService
    AuthService --> NotifyService
    StorageService --> ConfigService
```

## 5. Application Flow (Auth + Role Routing)

```mermaid
sequenceDiagram
    participant U as User
    participant LP as LoginPage
    participant AS as AuthService
    participant API as MockApiService
    participant ST as StorageService

    U->>LP: Submit credentials
    LP->>AS: login(email, password)
    AS->>API: login(request)
    API-->>AS: SessionUser (no password)
    AS->>ST: setSession(user)
    AS-->>LP: SessionUser
    LP->>U: Navigate /teacher or /student
```

## 6. Layer Architecture

```mermaid
flowchart TB
    subgraph Presentation["Presentation (React Components)"]
        Pages[Pages]
        Layout[Layout / Nav]
        Hooks[useAuth / useNotifications]
    end

    subgraph Application["Application Services (OOP)"]
        AuthSvc[AuthService]
        ApiSvc[MockApiService]
    end

    subgraph Infrastructure["Infrastructure Services (OOP)"]
        Config[ConfigService]
        Logger[LoggerService]
        Storage[StorageService]
        Notify[NotifyService]
    end

    subgraph Domain["Domain Entities (OOP)"]
        Entities[User, Exam, Question, Submission]
    end

    subgraph Data["Mock Data Layer"]
        DB[MockDatabase]
    end

    Pages --> Hooks
    Hooks --> AuthSvc
    Pages --> ApiSvc
    AuthSvc --> ApiSvc
    ApiSvc --> DB
    ApiSvc --> Logger
    ApiSvc --> Notify
    AuthSvc --> Storage
    ApiSvc --> Config
    ApiSvc --> Entities
    DB --> Entities
```
