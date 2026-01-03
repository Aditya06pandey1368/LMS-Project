import { MockTestSession } from "../models/mockTest.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ CORRECT SPELLING: These are the only valid model names.
const MODEL_CANDIDATES = [
  "gemini-1.5-flash",
  "gemini-pro"
];

const QUESTIONS_PROMPT = (topic) => `
Generate exactly 10 multiple-choice questions on "${topic}".
Return ONLY a valid JSON object. No markdown.
Schema:
{
  "questions": [
    {
      "prompt": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}
`;

// --- REAL BACKUP QUESTIONS (To solve "all questions are same" issue) ---
const BACKUP_DATABASE = [
  { prompt: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tool Multi Language", "None"], correctIndex: 0 },
  { prompt: "Which language is used for styling web pages?", options: ["HTML", "JQuery", "CSS", "XML"], correctIndex: 2 },
  { prompt: "Which is not a JavaScript Framework?", options: ["Python Script", "JQuery", "Django", "NodeJS"], correctIndex: 2 },
  { prompt: "What is used to connect to a Database?", options: ["PHP", "HTML", "JS", "All"], correctIndex: 0 },
  { prompt: "React.js is a...", options: ["Server-side framework", "User Interface library", "Database", "Operating System"], correctIndex: 1 },
  { prompt: "How do you define a variable in ES6?", options: ["var", "let", "define", "dim"], correctIndex: 1 },
  { prompt: "What does SQL stand for?", options: ["Structured Question Language", "Structured Query Language", "Strong Query Logic", "None"], correctIndex: 1 },
  { prompt: "Which hook is used for side effects in React?", options: ["useState", "useEffect", "useReducer", "useRef"], correctIndex: 1 },
  { prompt: "What is the command to install packages in Node?", options: ["npm install", "node install", "install package", "npm get"], correctIndex: 0 },
  { prompt: "Which symbol maps to the ID selector in CSS?", options: [".", "#", "*", "@"], correctIndex: 1 },
  { prompt: "Which method converts JSON data to a string?", options: ["JSON.parse()", "JSON.toString()", "JSON.stringify()", "JSON.convert()"], correctIndex: 2 },
  { prompt: "What is the default port for MongoDB?", options: ["3306", "5432", "27017", "8080"], correctIndex: 2 },
  { prompt: "Which HTTP method updates a resource?", options: ["GET", "POST", "PUT", "DELETE"], correctIndex: 2 },
  { prompt: "What is JSX?", options: ["JavaScript XML", "Java Syntax Extension", "JSON Xylophone", "None"], correctIndex: 0 },
  { prompt: "Redux is used for...", options: ["Routing", "State Management", "Styling", "Testing"], correctIndex: 1 }
];

// Helper to get 10 random questions if API fails
const getBackupQuestions = (topic) => {
  console.log(`⚠️ Serving backup questions for ${topic}`);
  // Shuffle array and take first 10
  const shuffled = [...BACKUP_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
};

async function generateQuestionsWithGemini(topic) {
  // Try models in order
  for (const modelName of MODEL_CANDIDATES) {
    try {
      console.log(`🤖 Connecting to Gemini: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(QUESTIONS_PROMPT(topic));
      const response = await result.response;
      let text = response.text();

      // Clean Markdown
      text = text.replace(/```json|```/gi, "").trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Invalid JSON");

      const parsed = JSON.parse(match[0]);
      
      console.log(`✅ Success with ${modelName}!`);
      
      // Ensure Options exist
      return parsed.questions.map(q => ({
        prompt: q.prompt || "Question",
        options: (Array.isArray(q.options) && q.options.length === 4) ? q.options : ["A", "B", "C", "D"],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
      }));

    } catch (err) {
      console.warn(`❌ Failed ${modelName}: ${err.message}`);
    }
  }

  // If ALL models fail, use the REAL backup questions
  console.error("🔥 All Gemini models failed. Serving Backup Database.");
  return getBackupQuestions(topic);
}

function clientSessionView(doc) {
  const now = new Date();
  const expiry = new Date(doc.expiresAt);
  const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

  return {
    _id: doc._id,
    course: doc.course,
    courseTitle: doc.courseTitle,
    questions: (doc.questions || []).map(q => ({ prompt: q.prompt, options: q.options })),
    status: doc.status,
    remainingSeconds: remaining,
    score: doc.score ?? null,
  };
}

function computeScore(session) {
  let correct = 0;
  if (!session.questions || session.questions.length === 0) return 0;
  for (const ans of session.answers) {
    const question = session.questions[ans.questionIndex];
    if (question && question.correctIndex === ans.selectedIndex) correct++;
  }
  return Math.round((correct / session.questions.length) * 100);
}

// ---- EXPORTED CONTROLLERS ----

export const startMockTest = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, courseTitle } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Invalidate old active sessions
    let session = await MockTestSession.findOne({ user: userId, course: courseId, status: "active" });
    if (session) {
      session.status = "expired";
      await session.save();
    }

    // Generate Questions (API or Backup)
    const questions = await generateQuestionsWithGemini(courseTitle);

    session = await MockTestSession.create({
      user: userId,
      course: courseId,
      courseTitle,
      questions,
      answers: [],
      status: "active",
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return res.status(201).json({ data: clientSessionView(session) });
  } catch (err) {
    console.error("startMockTest Error:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const saveAnswer = async (req, res) => {
  try {
    const { sessionId, questionIndex, selectedIndex } = req.body;
    const session = await MockTestSession.findOne({ _id: sessionId, user: req.id });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const existing = session.answers.find((a) => a.questionIndex === questionIndex);
    if (existing) existing.selectedIndex = selectedIndex;
    else session.answers.push({ questionIndex, selectedIndex });

    await session.save();
    return res.status(200).json({ data: { ok: true } });
  } catch (err) {
    return res.status(500).json({ message: "Save failed" });
  }
};

export const submitMockTest = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await MockTestSession.findOne({ _id: sessionId, user: req.id });
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.score = computeScore(session);
    session.status = "submitted";
    session.submittedAt = new Date();
    await session.save();

    return res.status(200).json({ data: { score: session.score, status: session.status, pass: session.score >= 50 } });
  } catch (err) {
    return res.status(500).json({ message: "Submit failed" });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await MockTestSession.findOne({ _id: req.params.sessionId, user: req.id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    return res.status(200).json({ data: clientSessionView(session) });
  } catch (err) {
    return res.status(500).json({ message: "Load failed" });
  }
};

export const getLastMockTestForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const session = await MockTestSession.findOne({
      user: req.id,
      course: courseId,
      status: { $in: ["submitted", "expired"] },
    })
      .sort({ submittedAt: -1, updatedAt: -1, startedAt: -1 })
      .lean();

    if (!session) return res.status(200).json({ data: null });

    return res.status(200).json({
      data: {
        score: session.score ?? 0,
        status: session.status,
        submittedAt: session.submittedAt || session.updatedAt || session.startedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load last mock test" });
  }
};