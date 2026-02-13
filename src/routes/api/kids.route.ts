import { Router } from "express";
import { kidsController } from "../../controllers/kids.controller.js";
// import { authenticate } from "../../middleware/auth.middleware.js"; // Optional: if auth is needed
// import { requireGroup } from "../../middleware/access.middleware.js"; // Optional: if specific group access needed

const router = Router();

// Public or protected routes depending on requirements.
// The user said "only available for kids".
// Assuming we need middleware to check if the user is a kid.
// I'll add the auth middleware and a check for "KIDS" group if possible, or just leave it open if auth is handled globally or differently.
// The user said "create a endpoints to get and post where only avaliable for kids".
// So I should use `authenticate` and `requireGroup("KIDS")`.

import { authenticate } from "../../middleware/auth.middleware.js";
import { requireGroup } from "../../middleware/access.middleware.js";

router.use(authenticate);

// GET /api/kids/drawing - Get a random drawing for kids to draw
router.get("/drawing", requireGroup("KIDS"), kidsController.getRandomDrawing);

// POST /api/kids/analyze - Analyze a kid's drawing
router.post("/analyze", requireGroup("KIDS"), kidsController.analyzeDrawing);

export default router;
