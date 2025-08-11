import Stripe from "stripe";
import dotenv from "dotenv";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import Lecture from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe Checkout Session
 */
export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.id;
        const { courseId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }

        // Create a new course purchase record
        const newPurchase = new CoursePurchase({
            courseId,
            userId,
            amount: course.coursePrice,
            status: "pending",
        });

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: course.courseTitle,
                            images: [course.courseThumbnail],
                        },
                        unit_amount: course.coursePrice * 100,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}`,
            cancel_url: `${process.env.FRONTEND_URL}/course-details/${courseId}`,
            metadata: {
                courseId: courseId,
                userId: userId,
                purchaseId: newPurchase._id.toString(), // so we can update it later
            },
            shipping_address_collection: {
                allowed_countries: ["IN"],
            },
        });

        if (!session.url) {
            return res.status(400).json({ error: "Failed to create Stripe session" });
        }

        newPurchase.paymentId = session.id;
        await newPurchase.save();

        return res.status(200).json({
            success: true,
            url: session.url,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * Stripe Webhook Handler
 */
export const stripeWebhook = async (req, res) => {
    let event;

    try {
        const sig = req.headers["stripe-signature"];
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET // use your real webhook secret here
        );
        console.log("✅ Webhook verified:", event.type);
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            const purchase = await CoursePurchase.findOne({
                paymentId: session.id,
            }).populate("courseId");

            if (!purchase) {
                return res.status(400).json({ message: "Purchase not found" });
            }

            purchase.amount = session.amount_total / 100;
            purchase.status = "completed";

            if (purchase.courseId && purchase.courseId.lectures.length > 0) {
                await Lecture.updateMany(
                    { _id: { $in: purchase.courseId.lectures } },
                    { $set: { isPreviewFree: true } }
                );
            }

            await purchase.save();

            await User.findByIdAndUpdate(
                purchase.userId,
                { $addToSet: { enrolledCourses: purchase.courseId._id } },
                { new: true }
            );

            await Course.findByIdAndUpdate(
                purchase.courseId._id,
                { $addToSet: { enrolledStudents: purchase.userId } },
                { new: true }
            );

            console.log(`✅ Purchase ${purchase._id} marked as completed`);
        }
    } catch (error) {
        console.error("Webhook processing error:", error);
    }

    res.status(200).send();
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const course = await Course.findById(courseId).populate({ path: "creator" }).populate({ path: "lectures" });

        const purchased = await CoursePurchase.findOne({ userId, courseId });
        if (!course) {
            return res.status(404).json({
                message: "course not found"
            })
        }
        return res.status(200).json({
            course,
            purchased: !!purchased
        })
    } catch (error) {
        console.log(error);
    }
}

export const getAllPurchasedCourse = async (_, res) => {
    try {
        const purchasedCourse = await CoursePurchase.find({ status: "completed" }).populate("courseId");
        if (!purchasedCourse) {
            return res.status(404).json({
                purchasedCourse: []
            })
        }
        return res.status(200).json({
            purchasedCourse
        })
    } catch (error) {
        console.log(error);
    }
}
