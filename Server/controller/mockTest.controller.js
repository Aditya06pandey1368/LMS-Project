// server/controllers/mockTest.controller.js
import { MockTestSession } from "../models/mockTest.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---- GEMINI ----
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_ID = "gemini-1.5-flash";

// Prompt to get strict JSON
const QUESTIONS_PROMPT = (topic) => `
Generate exactly 10 multiple-choice questions on "${topic}".
Return STRICT JSON only, no prose, matching this schema:

{
  "questions": [
    {
      "prompt": "string",
      "options": ["string","string","string","string"],
      "correctIndex": 0
    }
  ]
}

- "options" must be exactly 4
- "correctIndex" is an integer 0..3
- Questions should be beginner-to-intermediate for an LMS mock test
`;

// Ensure valid structure
function sanitizeGemini(json) {
  if (!json || !Array.isArray(json.questions) || json.questions.length !== 10) {
    throw new Error("Invalid questions JSON shape.");
  }
  json.questions.forEach((q, i) => {
    if (
      !q.prompt ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.correctIndex !== "number" ||
      q.correctIndex < 0 ||
      q.correctIndex > 3
    ) {
      throw new Error(`Invalid question at index ${i}`);
    }
  });
  return json.questions;
}

async function generateQuestionsWithGemini(topic) {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const result = await model.generateContent(QUESTIONS_PROMPT(topic));
  let text = result.response.text();

  // 🔹 Remove markdown code fences like ```json or ```
  text = text.replace(/```json|```/gi, "").trim();

  // 🔹 Extract first JSON object if extra prose exists
  const match = text.match(/\{[\s\S]*\}/);
  const jsonText = match ? match[0] : text;

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error("❌ Failed to parse Gemini output:", text);
    throw new Error("Gemini returned invalid JSON");
  }

  return sanitizeGemini(parsed);
}

// Remove correct keys before sending to client
function clientSessionView(doc) {
  const remaining = doc.remainingSeconds();
  const q = doc.questions.map(({ prompt, options }) => ({ prompt, options }));
  return {
    _id: doc._id,
    course: doc.course,
    courseTitle: doc.courseTitle,
    questions: q,
    answers: doc.answers, // only indices
    status: doc.status,
    startedAt: doc.startedAt,
    expiresAt: doc.expiresAt,
    remainingSeconds: remaining,
    score: doc.score ?? null,
  };
}

function computeScore(session) {
  let correct = 0;
  for (const ans of session.answers) {
    const key = session.questions[ans.questionIndex]?.correctIndex;
    if (typeof key === "number" && key === ans.selectedIndex) correct++;
  }
  const pct = Math.round((correct / session.questions.length) * 100);
  return pct;
}

// ---- CONTROLLERS ----

// POST /api/mocktests/start
export const startMockTest = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, courseTitle } = req.body;

    if (!courseId || !courseTitle) {
      return res.status(400).json({ message: "courseId and courseTitle are required" });
    }

    let session = await MockTestSession.findOne({
      user: userId,
      course: courseId,
      status: "active",
    });

    if (session) {
      if (session.remainingSeconds() <= 0) {
        session.status = "expired";
        await session.save();
      } else {
        return res.json({ data: clientSessionView(session) });
      }
    }

    const questions = await generateQuestionsWithGemini(courseTitle);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    session = await MockTestSession.create({
      user: userId,
      course: courseId,
      courseTitle,
      questions,
      answers: [],
      status: "active",
      startedAt: new Date(),
      expiresAt,
    });

    return res.json({ data: clientSessionView(session) });
  } catch (err) {
    console.error("startMockTest error:", err);
    return res.status(500).json({ message: "Failed to start mock test" });
  }
};

// POST /api/mocktests/answer
export const saveAnswer = async (req, res) => {
  try {
    const userId = req.id;
    const { sessionId, questionIndex, selectedIndex } = req.body;

    const session = await MockTestSession.findOne({ _id: sessionId, user: userId });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status !== "active") return res.status(400).json({ message: "Session not active" });

    if (session.remainingSeconds() <= 0) {
      session.status = "expired";
      await session.save();
      return res.status(400).json({ message: "Session expired" });
    }

    const existing = session.answers.find((a) => a.questionIndex === questionIndex);
    if (existing) existing.selectedIndex = selectedIndex;
    else session.answers.push({ questionIndex, selectedIndex });

    await session.save();
    return res.json({ data: { ok: true } });
  } catch (err) {
    console.error("saveAnswer error:", err);
    return res.status(500).json({ message: "Failed to save answer" });
  }
};

// POST /api/mocktests/submit
export const submitMockTest = async (req, res) => {
  try {
    const userId = req.id;
    const { sessionId } = req.body;

    const session = await MockTestSession.findOne({ _id: sessionId, user: userId });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status !== "active") {
      return res.json({
        data: {
          score: session.score ?? 0,
          status: session.status,
          pass: (session.score ?? 0) >= 50,
        },
      });
    }

    if (session.remainingSeconds() <= 0) {
      session.status = "expired";
      session.score = computeScore(session);
      session.submittedAt = new Date();
      await session.save();
      return res.json({ data: { score: session.score, status: "expired", pass: session.score >= 50 } });
    }

    session.score = computeScore(session);
    session.status = "submitted";
    session.submittedAt = new Date();
    await session.save();

    return res.json({ data: { score: session.score, status: "submitted", pass: session.score >= 50 } });
  } catch (err) {
    console.error("submitMockTest error:", err);
    return res.status(500).json({ message: "Failed to submit test" });
  }
};

// GET /api/mocktests/:sessionId
export const getSession = async (req, res) => {
  try {
    const userId = req.id;
    const { sessionId } = req.params;

    const session = await MockTestSession.findOne({ _id: sessionId, user: userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status === "active" && session.remainingSeconds() <= 0) {
      session.status = "expired";
      await session.save();
    }
    return res.json({ data: clientSessionView(session) });
  } catch (err) {
    console.error("getSession error:", err);
    return res.status(500).json({ message: "Failed to load session" });
  }
};

// ✅ NEW: GET /api/mocktests/last/:courseId
export const getLastMockTestForCourse = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.params;

    const session = await MockTestSession.findOne({
      user: userId,
      course: courseId,
      status: { $in: ["submitted", "expired"] },
    })
      .sort({ submittedAt: -1, updatedAt: -1, startedAt: -1 })
      .lean();

    if (!session) {
      return res.json({ data: null });
    }

    return res.json({
      data: {
        score: session.score ?? 0,
        status: session.status,
        submittedAt: session.submittedAt || session.updatedAt || session.startedAt,
      },
    });
  } catch (err) {
    console.error("getLastMockTestForCourse error:", err);
    return res.status(500).json({ message: "Failed to load last mock test" });
  }
};
