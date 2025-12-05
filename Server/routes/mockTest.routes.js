// server/routes/mockTest.routes.js
import express from "express";
import {
  startMockTest,
  saveAnswer,
  submitMockTest,
  getSession,
  getLastMockTestForCourse,
} from "../controllers/mockTest.controller.js";
import  isAuthenticated  from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/mocktests/start", isAuthenticated, startMockTest);
router.post("/mocktests/answer", isAuthenticated, saveAnswer);
router.post("/mocktests/submit", isAuthenticated, submitMockTest);
router.get("/mocktests/session/:sessionId", isAuthenticated, getSession);

// ✅ New route to fetch last score by course
router.get("/mocktests/last/:courseId", isAuthenticated, getLastMockTestForCourse);

export default router;
