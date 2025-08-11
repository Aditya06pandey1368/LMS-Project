import express from "express";
import { createCheckoutSession, getAllPurchasedCourse, getCourseDetailWithPurchaseStatus, stripeWebhook } from "../controllers/coursePurchase.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);

// Stripe webhook route (⚠ must come before body parsing middleware)
router.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
);

router.get("/course/:courseId/detail-with-status",isAuthenticated, getCourseDetailWithPurchaseStatus);

router.get("/", getAllPurchasedCourse);

export default router;
