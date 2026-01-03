import express from "express";
import {
  startMockTest,
  saveAnswer,
  submitMockTest,
  getSession,
  getLastMockTestForCourse,
} from "../controller/mockTest.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Routes are relative to "/api/mocktests"
router.post("/start", isAuthenticated, startMockTest);
router.post("/answer", isAuthenticated, saveAnswer);
router.post("/submit", isAuthenticated, submitMockTest);
router.get("/last/:courseId", isAuthenticated, getLastMockTestForCourse);
router.get("/:sessionId", isAuthenticated, getSession);

export default router;