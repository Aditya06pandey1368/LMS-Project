import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "What is this LMS portal?", answer: "It's a platform to learn online, track progress, take quizzes, earn certificates, and interact with courses easily." },
  { question: "How do I enroll in a course?", answer: "Visit the 'Our Courses' section, choose a course, and click enroll. For paid courses, complete the Stripe payment." },
  { question: "Can I track my lecture progress?", answer: "Yes! Your progress is auto-tracked, and you can see which lectures are completed in the course detail page." },
  { question: "Is there a mock test after course completion?", answer: "Yes, there is a mock test available after completing the course." },
  { question: "What is the Admin Dashboard used for?", answer: "Admins can manage courses, upload lectures, view revenue analytics, and monitor student activities." },
  { question: "How secure is my data on this LMS?", answer: "Your data is encrypted and securely stored in our database. We use modern auth and secure APIs to protect it." },
];

const FAQs = () => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  const [openIndex, setOpenIndex] = useState(null);
  const toggleFaq = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      {/* FAQs Section */}
      <motion.section
        ref={ref}
        style={{ scale, opacity }}
        className="min-h-screen px-6 py-12 md:px-12 lg:px-32 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
      >
        <h2 className="text-4xl py-2 font-extrabold text-center mb-12 mt-5 tracking-tight leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
            Frequently Asked
          </span>{" "}
          <span className="block">Questions</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="flex justify-between items-center w-full px-6 py-4 text-left text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {faq.question}
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0, y: -5 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -5 }}
                    transition={{
                      duration: 0.45,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        delay: 0.1,
                        duration: 0.3,
                      }}
                      className="px-6 pb-4 text-gray-600 dark:text-gray-300"
                    >
                      {faq.answer}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.section>

      

        {/* Bottom bar */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 border-t border-white/20 text-center py-4 text-sl text-gray-200">
          © {new Date().getFullYear()} LMS Portal. All rights reserved.
        </div>

    </>
  );
};

export default FAQs;
