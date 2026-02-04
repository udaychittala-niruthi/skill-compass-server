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

## Database Schema

Key models include:

- **User**: Stores user credentials, profile data, **age**, and **group**.
  - *Groups*: `KIDS`, `TEENS`, `COLLEGE_STUDENTS`, `PROFESSIONALS`, `SENIORS` (assigned based on age).
- **CollegeStudentPreferences**: Stores academic preferences (courses, branches) specifically for users in the `COLLEGE_STUDENTS` group.
- **Course, Skill, Interest, Branches**: Core entities for the education graph.
- **LearningPath**: Stores generated learning paths for users.

Relationships are defined in `src/models/index.ts`.

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
