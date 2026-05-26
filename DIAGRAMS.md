# ExamApp - דיאגרמות ארכיטקטורה

## 1️⃣ Components Hierarchy Diagram

```mermaid
graph TD
    App["📱 App.jsx<br/>Main Router"]
    
    App --> Nav["🧭 NavigationMenu<br/>Dynamic Role-Based"]
    App --> Auth["🔐 Auth Module"]
    App --> Teacher["👨‍🏫 Teacher Module"]
    App --> Student["👨‍🎓 Student Module"]
    
    Auth --> Login["Login Component"]
    Auth --> Register["Register Component"]
    
    Teacher --> TD["TeacherDashboard<br/>View & Manage Exams"]
    Teacher --> EB["ExamBuilder<br/>Create & Edit Exams"]
    Teacher --> SR["StudentResults<br/>View Results"]
    
    Student --> SD["StudentDashboard<br/>View Available Exams"]
    Student --> ET["ExamTaker<br/>Take Exam + Timer"]
    Student --> ER["ExamResults<br/>View Results"]
    
    style App fill:#ff9999
    style Nav fill:#99ccff
    style Auth fill:#99ff99
    style Teacher fill:#ffcc99
    style Student fill:#cc99ff
```

---

## 2️⃣ UML Class Diagram - Services

```mermaid
classDiagram
    class AuthService {
        -currentUser: Object
        -token: String
        +login(email, password) Promise
        +register(name, email, password, role) Promise
        +logout() Object
        +isAuthenticated() Boolean
        +isLecturer() Boolean
        +isStudent() Boolean
        +getCurrentUser() Object
        +getToken() String
        +getUserInfo() Object
        +refreshToken(token) Boolean
    }
    
    class ValidationService {
        -emailRegex: RegExp
        -passwordRegex: RegExp
        +validateEmail(email) Object
        +validatePassword(password) Object
        +validateName(name) Object
        +validateExamTitle(title) Object
        +validateQuestion(question) Object
        +validateExam(exam) Object
        +validateLoginForm(data) Object
        +validateRegisterForm(data) Object
    }
    
    class MockDBService {
        -users: Array
        -exams: Array
        -submissions: Array
        +login(email, password) Promise
        +register(name, email, password, role) Promise
        +getExams() Promise
        +getExamById(id) Promise
        +createExam(data) Promise
        +submitExam(data) Promise
    }
    
    class StorageService {
        -storage: localStorage
        +save(key, value) void
        +retrieve(key) Object
        +remove(key) void
        +clear() void
    }
    
    class ConfigService {
        -config: Object
        +get(key) Any
        +set(key, value) void
        +getAll() Object
    }
    
    class LoggerService {
        +formatMessage(level, message) String
        +info(message) void
        +warn(message) void
        +error(message) void
    }
    
    class NotifyService {
        +success(message) void
        +error(message) void
    }
    
    AuthService --> ValidationService
    AuthService --> MockDBService
    AuthService --> StorageService
    
    style AuthService fill:#90EE90
    style ValidationService fill:#87CEEB
    style MockDBService fill:#FFB6C1
    style StorageService fill:#DDA0DD
    style ConfigService fill:#F0E68C
    style LoggerService fill:#FFA07A
    style NotifyService fill:#98FB98
```

---

## 3️⃣ Entity Relationship Diagram (DB/Views)

```mermaid
erDiagram
    USER ||--o{ EXAM : "creates/teaches"
    USER ||--o{ SUBMISSION : "submits"
    EXAM ||--o{ QUESTION : "contains"
    EXAM ||--o{ SUBMISSION : "has"
    SUBMISSION ||--o{ SUBMISSION_ANSWER : "includes"
    QUESTION ||--o{ SUBMISSION_ANSWER : "answered_in"
    
    USER {
        string id PK
        string name
        string email UK
        string password
        string role "lecturer|student"
        datetime created_at
    }
    
    EXAM {
        string id PK
        string title
        string instructions
        string status "Draft|Published|Archived"
        string lecturer_id FK
        datetime created_at
        datetime updated_at
    }
    
    QUESTION {
        string id PK
        string exam_id FK
        string type "multiple-choice|open-ended|true-false"
        string text
        string[] options
        string correct_answer
        int order
    }
    
    SUBMISSION {
        string id PK
        string exam_id FK
        string student_id FK
        datetime submitted_at
        int score
        string status "in-progress|submitted|graded"
    }
    
    SUBMISSION_ANSWER {
        string id PK
        string submission_id FK
        string question_id FK
        string answer
        boolean is_correct
    }
    
    style USER fill:#90EE90
    style EXAM fill:#87CEEB
    style QUESTION fill:#FFB6C1
    style SUBMISSION fill:#DDA0DD
    style SUBMISSION_ANSWER fill:#F0E68C
```

---

## 4️⃣ Use Case Diagram

```mermaid
graph TB
    subgraph Actors
        Lecturer["👨‍🏫 Lecturer"]
        Student["👨‍🎓 Student"]
        Guest["👤 Guest"]
    end
    
    subgraph System["📋 ExamApp System"]
        UC1["Login"]
        UC2["Register"]
        UC3["Create Exam"]
        UC4["Edit Exam"]
        UC5["Delete Exam"]
        UC6["Publish Exam"]
        UC7["Change Status"]
        UC8["View Exam List"]
        UC9["View Results"]
        UC10["Take Exam"]
        UC11["Submit Exam"]
        UC12["View My Results"]
    end
    
    Guest --> UC1
    Guest --> UC2
    
    Lecturer --> UC3
    Lecturer --> UC4
    Lecturer --> UC5
    Lecturer --> UC6
    Lecturer --> UC7
    Lecturer --> UC8
    Lecturer --> UC9
    
    Student --> UC8
    Student --> UC10
    Student --> UC11
    Student --> UC12
    
    style Lecturer fill:#99ccff
    style Student fill:#99ff99
    style Guest fill:#cccccc
    style UC1 fill:#ffcccc
    style UC2 fill:#ffcccc
    style UC3 fill:#99ccff
    style UC4 fill:#99ccff
    style UC5 fill:#99ccff
    style UC6 fill:#99ccff
    style UC7 fill:#99ccff
    style UC8 fill:#ffff99
    style UC9 fill:#99ccff
    style UC10 fill:#99ff99
    style UC11 fill:#99ff99
    style UC12 fill:#99ff99
```

---

## 5️⃣ Authentication Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant User as User
    participant App as React App
    participant Auth as AuthService
    participant Val as ValidationService
    participant DB as MockDBService
    participant Store as StorageService
    
    User->>App: Enter Credentials
    App->>Auth: login(email, password)
    Auth->>Val: validateLoginForm()
    Val-->>Auth: {valid, message}
    
    alt Validation Success
        Auth->>DB: login(email, password)
        DB-->>Auth: {user, token}
        Auth->>Store: save(auth_key, {user, token})
        Auth-->>App: {success, user, message}
        App->>User: Show Dashboard
    else Validation Failed
        Auth-->>App: {success: false, message}
        App->>User: Show Error
    end
```

---

## 6️⃣ Exam Creation Flow

```mermaid
sequenceDiagram
    participant L as Lecturer
    participant UI as ExamBuilder
    participant Val as ValidationService
    participant DB as MockDBService
    participant Not as NotifyService
    
    L->>UI: Fill exam details
    UI->>Val: validateExam()
    Val-->>UI: Validation Result
    
    alt Valid
        UI->>DB: createExam(examData)
        DB-->>UI: Created Exam
        UI->>Not: success("Exam Created")
        Not->>L: Show Success Message
    else Invalid
        UI->>Not: error("Validation Error")
        Not->>L: Show Error Message
    end
```

---

## 7️⃣ Application State Flow

```mermaid
graph LR
    Start["🚀 App Start"]
    Check["Check Auth in Storage"]
    Logged["✅ Logged In"]
    NotLogged["❌ Not Logged In"]
    Dashboard["📊 Dashboard"]
    Login["🔐 Login/Register"]
    
    Start --> Check
    Check -->|Has Valid Token| Logged
    Check -->|No Token| NotLogged
    Logged --> Dashboard
    NotLogged --> Login
    Login -->|Success| Logged
    Login -->|Cancel| NotLogged
    Dashboard -->|Logout| NotLogged
    
    style Start fill:#ff9999
    style Logged fill:#99ff99
    style NotLogged fill:#ff9999
    style Dashboard fill:#99ccff
    style Login fill:#ffff99
```

---

## 8️⃣ Module Dependencies

```mermaid
graph TD
    App["🎯 App"]
    
    Auth["🔐 Authentication"]
    Validation["✔️ Validation"]
    Storage["💾 Storage"]
    Config["⚙️ Configuration"]
    Logger["📝 Logger"]
    Notify["📢 Notify"]
    MockDB["🗄️ Mock DB"]
    
    Teacher["👨‍🏫 Teacher Module"]
    Student["👨‍🎓 Student Module"]
    
    App --> Auth
    App --> Teacher
    App --> Student
    
    Auth --> Validation
    Auth --> Storage
    Auth --> MockDB
    
    Teacher --> Validation
    Teacher --> MockDB
    Teacher --> Notify
    Teacher --> Logger
    
    Student --> Validation
    Student --> MockDB
    Student --> Notify
    Student --> Logger
    
    Auth --> Config
    Teacher --> Config
    Student --> Config
    
    style App fill:#ff9999
    style Auth fill:#99ff99
    style Validation fill:#87CEEB
    style Storage fill:#DDA0DD
    style Config fill:#F0E68C
    style Logger fill:#FFA07A
    style Notify fill:#98FB98
    style MockDB fill:#FFB6C1
    style Teacher fill:#99ccff
    style Student fill:#99ff99
```

---

## Notes:

1. **Components Hierarchy** - מבנה הקומפוננטות המלא עם ניווט דינמי
2. **UML Class** - כל ה-Services עם שיטות ותכונות
3. **Entity Relationship** - מבנה ה-DB הלוגי עם יחסים
4. **Use Cases** - כל הפעולות שמשתמש יכול לעשות
5. **Sequence Diagrams** - זרימת התחברות ויצירת בחינה
6. **State Flow** - זרימת מצבי ההתחברות
7. **Dependencies** - קשרי תלות בין מודולים
