import express from "express";
import {
  startMockTest,
  saveAnswer,
  submitMockTest,
  getSession,
} from "../Controllers/mockTest.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Start a mock test
router.post("/start", isAuthenticated, startMockTest);

// Save an answer
router.post("/answer", isAuthenticated, saveAnswer);

// Submit the mock test
router.post("/submit", isAuthenticated, submitMockTest);

// Get a session by ID
router.get("/:sessionId", isAuthenticated, getSession);

export default router;
