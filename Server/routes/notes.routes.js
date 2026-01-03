console.log("🔥 notes.routes.js LOADED");

import express from "express";
import { generateQuickNotes } from "../controller/notes.controller.js";
import isAuthenticated  from "../middlewares/isAuthenticated.js";

const router = express.Router();
router.use((req, res, next) => {
  console.log("➡️ NOTES ROUTE HIT:", req.method, req.path);
  next();
});


router.post("/generate",  generateQuickNotes);

export default router;
