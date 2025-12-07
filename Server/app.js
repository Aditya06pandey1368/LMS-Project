import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDb from "./Database/dbConnect.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import notesRoutes from "./routes/notes.routes.js";
import mediaRoute from "./routes/media.route.js";
import mockTestRoutes from "./routes/mockTest.routes.js";
import coursePurchaseRoutes from "./routes/coursePurchase.route.js";
import { stripeWebhook } from "./controller/coursePurchase.controller.js";
import courseProgressRoutes from "./routes/courseProgress.route.js";

dotenv.config({});

// Calling Database connection
connectDb();
const app = express();

const PORT = process.env.PORT || 3001;

// Stripe webhook route MUST come before express.json()
app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
);

// Default middleware (after webhook)
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        // ✅ CHANGE: Add your Render Frontend URL here
        origin: [
            "http://localhost:5173", 
            "https://lms-project-frontend-bdbm.onrender.com" 
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow Authorization header
    })
);

// APIs
app.use("/api/media", mediaRoute);
app.use("/api/user", userRoute);
app.use("/api/course", courseRoute);
app.use("/api/course-purchase", coursePurchaseRoutes);
app.use("/api/progress", courseProgressRoutes);
app.use("/api", mockTestRoutes);
app.use("/api/notes", notesRoutes);

app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});