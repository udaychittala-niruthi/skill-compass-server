# Skill Compass Server

## Overview

Skill Compass Server is the backend application for the Skill Compass platform, designed to guide users in their learning journeys based on their interests and skills. It provides a robust API for user authentication, profile management, and personalized learning path generation using AI integrations.

## Architecture

The architecture follows a microservices-inspired approach with a primary Node.js/Express monolith for core logic and external integration with specialized services.

```mermaid
graph TD
    Client[Client App] -->|HTTP/REST| Server[Express Server]
    Server -->|ORM| DB[(PostgreSQL)]
    Server -->|SDK| Groq[Groq AI Service]
    Server -->|HTTP| PyService[Python FastAPI Service]
    PyService -->|CLIP| AI_Model[CLIP Model]
```

### Key Components

- **Core Backend**: Built with **Node.js** and **Express.js** (TypeScript). Handles API requests, authentication, and business logic.
- **Database**: **PostgreSQL**, managed via **Sequelize ORM**. Stores users, courses, skills, and preferences.
- **AI Integration**:
  - **Groq SDK**: Used for generating intelligent learning paths and content.
  - **CLIP Service**: Interacts with a separate Python FastAPI service for image comparison and analysis.
- **Authentication**: Secure JWT-based authentication with Bcrypt for password hashing.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **AI/ML**: Groq SDK, CLIP (via external service)
- **Utilities**: Multer (File Upload), Joi (Validation), Sharp/Jimp (Image Processing)

## Folder Structure

```
skill-compass-server/
├── src/
│   ├── config/         # App and Database configuration
│   ├── controllers/    # Request handlers (Auth, Users, Clip)
│   ├── middleware/     # Express middleware (Auth, Logging)
│   ├── models/         # Sequelize definitions (User, Course, etc.)
│   ├── routes/         # API Route definitions
│   ├── seeders/        # Database seeding scripts
│   ├── services/       # External services (Groq AI)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper utilities
│   ├── validations/    # Joi validation schemas
│   └── app.ts          # Express App setup
├── index.ts            # Entry point
├── .env                # Environment variables
└── package.json        # Dependencies and Scripts
```

## Domain Model & Database Schema

The comprehensive data model supports the platform's personalized learning features.

### 1. User & Profiles

- **User**: Core identity managing credentials, authentication, age, and broad user groups (`KIDS`, `TEENS`, `COLLEGE_STUDENTS`, `PROFESSIONALS`, `SENIORS`).
- **UserPortfolio**: A public-facing profile showcasing a user's `headline`, `bio`, `skillsShowcase`, `featuredWork` (assessments), and `achievements`.
- **UserPreferences**: Stores detailed preferences including arrays of `Interests` and `Skills`, as well as `Courses` and `Branches`. Detailed metadata for `COLLEGE_STUDENTS` is managed here or in related specialized tables.

### 2. Educational Content Structure

- **Course**: A high-level educational program.
- **LearningModule**: Atomic units of learning content within a course.
  - *Types*: `micro-lesson`, `project`, `assessment`, `certification`, `workshop`, `reading`.
  - *Formats*: `video`, `article`, `interactive`, `quiz`, etc.
- **Assessment**: Evaluative components like quizzes, exams, or projects.
  - *Status*: Tracks if an assessment is `not-started`, `in-progress`, `submitted`, `graded`, etc.
- **Certification**: Official certifications available to be earned.
- **Skill** & **Interest**: Tagging entities to connect users with relevant content.
- **Branches**: Academic branches (e.g., CSE, ECE) linked to courses.

### 3. Progress Tracking

- **LearningPath**: A personalized sequence of modules and courses generated for a user.
- **LearningSchedule**: Time-based planning entities to help users manage their learning pace.
- **UserModuleProgress**: Tracks granular progress (completion status, time spent) on specific `LearningModules`.
- **UserCertification**: Tracks a user's journey towards a certification (`interested`, `preparing`, `scheduled`, `passed`, `failed`).
- **AiAnalysis**: Stores AI-generated insights such as `skill-gap` analysis, `career-path` recommendations, and `study-plan` suggestions.

### Relations

Relationships are strictly defined in `src/models/index.ts` using Sequelize associations.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL
- Python (for the associated FastAPI service, if running locally)

### Installation

1. **Clone the repository**
2. **Install dependencies**:

    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5001
DATABASE_URL=postgres://user:password@localhost:5432/skill_compass
JWT_SECRET=your_jwt_secret
FASTAPI_URL=http://localhost:8000
GROQ_API_KEY=your_groq_api_key
```

### Running the Server

- **Development Mode**:

    ```bash
    npm run dev
    ```

    (Uses `tsx` for hot-reloading)

- **Production Build**:

    ```bash
    npm run build
    npm start
    ```

- **Database Seeding**:

    ```bash
    npm run seed
    ```

## API Overview

- **Auth**: `/api/auth` (Register, Login)
- **Users**: `/api/users` (Profile management)
- **CLIP**: `/api/clip` (Image comparison service)
