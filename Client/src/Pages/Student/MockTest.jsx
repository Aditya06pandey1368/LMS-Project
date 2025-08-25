import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  useStartMockTestMutation,
  useSaveAnswerMutation,
  useSubmitMockTestMutation,
} from "@/Features/api/mockTestApi";
import { CheckCircle2, TimerReset } from "lucide-react";
import toast from "react-hot-toast";

export default function MockTest() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation(); // state?.courseTitle from CourseProgress Link
  const courseTitle = state?.courseTitle || "Course";

  const [startMockTest, { data: startData, isLoading: starting }] =
    useStartMockTestMutation();
  const [saveAnswer, { isLoading: saving }] = useSaveAnswerMutation();
  const [submitMockTest, { data: submitData, isLoading: submitting }] =
    useSubmitMockTestMutation();

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [remaining, setRemaining] = useState(0); // seconds
  const timerRef = useRef(null);

  // Start or resume session
  useEffect(() => {
    (async () => {
      try {
        const res = await startMockTest({ courseId, courseTitle }).unwrap();
        setSession(res.data);
        setRemaining(res.data.remainingSeconds || 15 * 60);

        // If user has previous answers, resume at next unanswered
        const answered = new Set(
          (res.data.answers || []).map((a) => a.questionIndex)
        );
        const firstUnanswered = (res.data.questions || []).findIndex(
          (_, idx) => !answered.has(idx)
        );
        setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
      } catch (e) {
        toast.error(e?.data?.message || "Failed to start test");
        navigate(-1);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Countdown
  useEffect(() => {
    if (!session || session.status !== "active") return;
    timerRef.current = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [session]);

  const question = useMemo(
    () => session?.questions?.[currentIndex],
    [session, currentIndex]
  );
  const total = session?.questions?.length || 10;
  const pct = Math.round((currentIndex / total) * 100);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const handleSelect = (idx) => {
    setSelected(idx); // turn selected yellow immediately
  };

  const handleSaveNext = async () => {
    if (selected == null) {
      toast("Please choose an option.", { icon: "👉" });
      return;
    }
    try {
      await saveAnswer({
        sessionId: session._id,
        questionIndex: currentIndex,
        selectedIndex: selected,
      }).unwrap();

      // reset selection and move on
      setSelected(null);
      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // last question -> submit
        await handleSubmit();
      }
    } catch (e) {
      toast.error(e?.data?.message || "Failed to save answer");
    }
  };

  const handleSubmit = async (auto = false) => {
    try {
      const res = await submitMockTest({ sessionId: session._id }).unwrap();
      setSession((prev) => ({
        ...prev,
        status: res.data.status,
        score: res.data.score,
      }));
      if (auto) toast("Time's up! Auto-submitted.", { icon: "⏱️" });
    } catch (e) {
      toast.error(e?.data?.message || "Failed to submit");
    }
  };

  // Motivational messages
  const getMessage = (s) => {
    if (s === 100) return "Perfect! You're unstoppable 🔥";
    if (s >= 90) return "Outstanding! Keep pushing boundaries ✨";
    if (s >= 80) return "Great job! You’re almost at mastery 💡";
    if (s >= 70) return "Nice work! Keep practicing ⚡";
    if (s >= 50) return "Good effort! You’re improving 🌱";
    if (s >= 30) return "Keep going, small steps matter 🌻"; 
    return "Don’t give up — try again 💪";
  };

  // Score screen
  if (session && (session.status === "submitted" || session.status === "expired")) {
    const score = session.score ?? 0;

    return (
      <div className="min-h-screen mt-15 pt-20 p-4 md:p-10 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {courseTitle} Test — Result
              </h1>
              <Badge className={score >= 50 ? "bg-green-600" : "bg-red-600"}>
                {score >= 50 ? "Passed" : "Failed"}
              </Badge>
            </div>

            <div className="mb-6">
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-2">
                Score: <span className="font-semibold">{score}%</span>
              </p>
              <Progress value={score} className="h-3" />
            </div>

            <div className="space-y-4 text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {getMessage(score)}
              </p>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Back to Course
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 pt-20 p-4 md:p-10 bg-white dark:bg-gray-950 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {courseTitle} Test
          </h1>
          <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <TimerReset className="w-5 h-5" />
            <span className="font-mono">
              {mm}:{ss}
            </span>
          </div>
        </div>

        <Card className="p-6 md:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Question {currentIndex + 1} of {total}
              </span>
              <Badge variant="secondary">
                {Math.round(((currentIndex + 1) / total) * 100)}%
              </Badge>
            </div>
            <Progress value={(currentIndex / total) * 100} className="h-2" />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {question?.prompt || (starting ? "Loading question..." : "—")}
              </h2>

              {/* Options */}
              <div className="grid gap-3">
                {(question?.options || []).map((opt, idx) => {
                  const isSelected = selected === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(idx)}
                      className={[
                        "w-full text-left px-4 py-3 rounded-xl border transition",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-200 dark:border-gray-700",
                        "hover:shadow-sm focus:outline-none",
                        isSelected
                          ? "ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/30"
                          : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                        )}
                        <span className="text-gray-900 dark:text-gray-100">
                          {opt}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
                  Exit
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      // allow skipping (save nothing) to come back later
                      if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
                      else await handleSubmit();
                    }}
                    className="rounded-xl"
                  >
                    Skip
                  </Button>

                  <Button
                    onClick={handleSaveNext}
                    disabled={saving || submitting || starting}
                    className="rounded-xl"
                  >
                    {currentIndex === total - 1 ? "Save & Submit" : "Save & Next"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
