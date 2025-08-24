import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: {
      type: [String],
      validate: (arr) => arr.length === 4,
      required: true,
    },
    correctIndex: { type: Number, min: 0, max: 3, required: true }, // server-only
  },
  { _id: false }
);

const AnswerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedIndex: { type: Number, min: 0, max: 3, required: true },
  },
  { _id: false }
);

const MockTestSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    courseTitle: { type: String, required: true },

    questions: { type: [QuestionSchema], required: true },
    answers: { type: [AnswerSchema], default: [] },

    status: {
      type: String,
      enum: ["active", "submitted", "expired"],
      default: "active",
      index: true,
    },

    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    submittedAt: { type: Date },

    durationSeconds: { type: Number, default: 15 * 60 }, // 15 minutes
    score: { type: Number }, // percentage 0-100
  },
  { timestamps: true }
);

// Helper
MockTestSessionSchema.methods.remainingSeconds = function () {
  if (this.status !== "active") return 0;
  const now = Date.now();
  const ms = new Date(this.expiresAt).getTime() - now;
  return ms > 0 ? Math.floor(ms / 1000) : 0;
};

export const MockTestSession = mongoose.model("MockTestSession", MockTestSessionSchema);
