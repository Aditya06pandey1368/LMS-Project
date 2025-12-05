import express from "express";
import { generateQuickNotes } from "../controllers/notes.controller.js";
import isAuthenticated  from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/generate", isAuthenticated, generateQuickNotes);

export default router;
