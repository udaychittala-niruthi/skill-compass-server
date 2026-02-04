# Postman Collection Update Summary

## Added Endpoints

Successfully added **10 new API endpoints** across 3 categories to the Skill Compass Postman Collection.

### 1. Learning Path (4 endpoints)

#### GET `/api/learning-path/status`

- **Description**: Check generation status of user's learning path
- **Auth**: Bearer Token Required
- **Returns**: Status (generating, completed, failed)

#### GET `/api/learning-path/my-path`

- **Description**: Retrieve complete learning path with all modules, resources, and metadata
- **Auth**: Bearer Token Required
- **Returns**: Full learning path object with modules array

#### GET `/api/learning-path/:pathId/modules`

- **Description**: Get all modules for a specific learning path
- **Auth**: Bearer Token Required
- **Path Parameter**: `pathId` (Learning Path ID)

#### POST `/api/learning-path/regenerate`

- **Description**: Trigger regeneration of user's learning path (deletes existing, creates new)
- **Auth**: Bearer Token Required
- **Body**: Empty

---

### 2. Learning Progress (3 endpoints)

#### GET `/api/learning-progress/my-progress`

- **Description**: Get all learning progress for authenticated user
- **Auth**: Bearer Token Required
- **Returns**: Array of progress records

#### GET `/api/learning-progress/module/:moduleId`

- **Description**: Get progress for a specific module
- **Auth**: Bearer Token Required
- **Path Parameter**: `moduleId` (Learning Module ID)

#### POST `/api/learning-progress/module/:moduleId`

- **Description**: Update progress for a module
- **Auth**: Bearer Token Required
- **Path Parameter**: `moduleId` (Learning Module ID)
- **Body**:

```json
{
    "status": "in_progress",
    "progressPercentage": 50,
    "timeSpentMinutes": 30,
    "rating": 4,
    "feedback": "Great content!"
}
```

- **Status Values**: `not_started`, `in_progress`, `completed`, `skipped`

---

### 3. Learning Schedule (2 endpoints)

#### GET `/api/learning-schedule/my-schedule`

- **Description**: Get learning schedule for authenticated user
- **Auth**: Bearer Token Required
- **Returns**: Scheduled learning periods with modules

#### POST `/api/learning-schedule/:scheduleId/status`

- **Description**: Update status of a schedule period
- **Auth**: Bearer Token Required
- **Path Parameter**: `scheduleId` (Schedule Period ID)
- **Body**:

```json
{
    "status": "completed"
}
```

- **Status Values**: `pending`, `in_progress`, `completed`, `skipped`

---

## Collection Structure

The Postman collection now includes **5 folders**:

1. ✅ **Auth** (2 endpoints) - Register, Login
2. ✅ **Onboarding** (6 endpoints) - Status check + 5 user group onboarding flows
3. ✅ **Common & Prediction** (6 endpoints) - Get interests, skills, courses, branches + predictions
4. **NEW** ✅ **Learning Path** (4 endpoints) - Path generation and retrieval
5. **NEW** ✅ **Learning Progress** (3 endpoints) - Progress tracking
6. **NEW** ✅ **Learning Schedule** (2 endpoints) - Schedule management

---

## Variables

The collection uses 2 variables:

- `{{base_url}}` - Default: `http://localhost:5003/api`
- `{{token}}` - Auto-populated from login/register responses

---

## Authentication

All endpoints except **Auth > Register** and **Auth > Login** require Bearer Token authentication, which is automatically handled using the `{{token}}` variable.

---

## Testing Workflow

**Recommended test flow:**

1. **Auth > Register** or **Auth > Login** → Auto-sets `{{token}}`
2. **Onboarding > Onboard [UserType]** → Triggers learning path generation
3. **Learning Path > Get Generation Status** → Check if generation completed
4. **Learning Path > Get My Learning Path** → Retrieve generated path with modules
5. **Learning Progress > Update Module Progress** → Track learning progress
6. **Learning Schedule > Get My Schedule** → View scheduled learning periods
7. **Learning Progress > Get My Progress** → Check overall progress

---

## What's New

The newly added endpoints support:

✅ **AI-Generated Learning Paths** - Personalized for each user group  
✅ **Real Educational Resources** - YouTube videos, PDFs, thumbnails  
✅ **Progress Tracking** - Module-level progress with ratings and feedback  
✅ **Smart Scheduling** - Week/semester-based learning schedules  
✅ **Prerequisite Validation** - Modules properly ordered with dependencies  
✅ **Format Metadata** - Complete resource information (video/HD/duration)

---

## File Location

**Updated file**: [`SkillCompass_Postman_Collection.json`](file:///home/uday-kumar/projects/skill-compass-server/SkillCompass_Postman_Collection.json)

Import this file into Postman to test all endpoints!
