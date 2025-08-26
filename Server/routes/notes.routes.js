import express from "express";
import { generateQuickNotes } from "../Controllers/notes.controller.js";
import isAuthenticated  from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/generate", isAuthenticated, generateQuickNotes);

export default router;
