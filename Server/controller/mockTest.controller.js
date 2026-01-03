import { MockTestSession } from "../models/mockTest.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ FIX: Use exactly this string to avoid the Google 404 error
const MODEL_ID = "gemini-1.5-flash"; 

const QUESTIONS_PROMPT = (topic) => `
Generate exactly 10 multiple-choice questions on "${topic}".
Return ONLY a valid JSON object. No markdown code blocks.
Schema:
{
  "questions": [
    {
      "prompt": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }
  ]
}
`;

/**
 * Robust logic to generate questions and parse AI response
 */
async function generateQuestionsWithGemini(topic) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_ID });
    const result = await model.generateContent(QUESTIONS_PROMPT(topic));
    const response = await result.response;
    let text = response.text();

    // 1. Clean markdown fences
    text = text.replace(/```json|```/gi, "").trim();

    // 2. Extract JSON using Regex
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI did not return valid JSON");

    const parsed = JSON.parse(match[0]);

    // 3. Ensure options are correctly mapped so they appear on frontend
    return parsed.questions.map(q => ({
        prompt: q.prompt || "Knowledge Check",
        options: (Array.isArray(q.options) && q.options.length === 4) ? q.options : ["1", "2", "3", "4"],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
    }));

  } catch (err) {
    console.error("Gemini Generation Error:", err.message);
    // ✅ SAFE FALLBACK: If AI fails, return dummy questions so server doesn't crash
    return Array(10).fill({
      prompt: `Review question for ${topic}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0
    });
  }
}

/**
 * Formats the session data for the frontend
 */
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

/**
 * Basic score calculation logic
 */
function computeScore(session) {
  let correct = 0;
  if (!session.questions || session.questions.length === 0) return 0;

  for (const ans of session.answers) {
    const question = session.questions[ans.questionIndex];
    if (question && question.correctIndex === ans.selectedIndex) {
      correct++;
    }
  }
  return Math.round((correct / session.questions.length) * 100);
}

// ---- EXPORTED CONTROLLERS ----

export const startMockTest = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, courseTitle } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let session = await MockTestSession.findOne({ user: userId, course: courseId, status: "active" });

    if (session) {
      if (new Date() > new Date(session.expiresAt)) {
        session.status = "expired";
        await session.save();
      } else {
        return res.status(200).json({ data: clientSessionView(session) });
      }
    }

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
    console.error("START_MOCK_TEST_ERROR:", err.message);
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

// ✅ EXPLICIT EXPORT: This was causing your crash
export const getSession = async (req, res) => {
  try {
    const session = await MockTestSession.findOne({ _id: req.params.sessionId, user: req.id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    return res.status(200).json({ data: clientSessionView(session) });
  } catch (err) {
    console.error("getSession error:", err);
    return res.status(500).json({ message: "Load failed" });
  }
};

// ✅ EXPLICIT EXPORT: Required for route fetching last scores
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
    console.error("getLastMockTestForCourse error:", err);
    return res.status(500).json({ message: "Failed to load last mock test" });
  }
};