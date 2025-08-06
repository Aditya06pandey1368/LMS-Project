import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureTitle: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
    },
    publicId: {
      type: String,
    },
    isPreviewFree: {
      type: Boolean,
      default:false
    },
  },
  {
    timestamps: true,
  }
);

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture; // ✅ ES Module default export
