import React, { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CirclePlay } from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const initialLectures = [
    { title: "Introduction", isCompleted: true },
    { title: "Setting VS code", isCompleted: false },
    { title: "First project", isCompleted: false },
    { title: "End of the Course", isCompleted: false },
];

export default function CourseProgress() {
    const [lectures, setLectures] = useState(initialLectures);
    const [allCompleted, setAllCompleted] = useState(false);

    const toggleCompletion = () => {
        const newCompleted = !allCompleted;
        setAllCompleted(newCompleted);
        setLectures((prev) =>
            prev.map((lec) => ({ ...lec, isCompleted: newCompleted }))
        );
        toast.success(
            newCompleted
                ? "All lectures marked as completed!"
                : "Marked all lectures as incomplete."
        );
    };

    return (
        <>
            <Toaster position="bottom-right" />
            <div className="min-h-screen pt-20 p-6 bg-white dark:bg-gray-950 transition-colors duration-500">
                <div className="w-full md:p-10 mx-auto flex flex-col md:flex-row gap-20">
                    {/* Section A */}
                    <section className="md:w-1/2 flex flex-col gap-6">
                        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                            HTML
                        </h1>
                        {/* Video placeholder */}
                        <Card className="p-5 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                            <div className="bg-gray-200 dark:bg-gray-800 aspect-video rounded-md shadow-inner flex items-center justify-center text-gray-400 dark:text-gray-500 select-none">
                                Video placeholder
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                Lecture-1 : Introduction
                            </h3>
                        </Card>

                    </section>

                    {/* Section B */}
                    <section className="md:w-1/2 flex mt-5 flex-col gap-6">
                        <Button
                            onClick={toggleCompletion}
                            className={`self-start ${allCompleted
                                    ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                    : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                } text-white transition-colors`}
                        >
                            {allCompleted ? "Mark as incomplete" : "Mark as completed"}
                        </Button>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Course Lectures
                        </h2>

                        <div className="flex flex-col gap-4">
                            {lectures.map(({ title, isCompleted }, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    className="cursor-pointer"
                                >
                                    <Card className="flex justify-between px-6 py-4 w-full">
                                        {/* Left side: Icon + Title */}
                                        <div className="flex justify-between gap-3">
                                            <div className="flex gap-2">
                                                {isCompleted ? (
                                                    <CheckCircle2
                                                        className="text-green-600 dark:text-green-400"
                                                        size={24}
                                                    />
                                                ) : (
                                                    <CirclePlay
                                                        className="text-gray-400 dark:text-gray-500"
                                                        size={24}
                                                    />
                                                )}
                                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100 m-0">
                                                    {title}
                                                </CardTitle>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`${isCompleted
                                                        ? "text-green-700 border-green-700 dark:text-green-400 dark:border-green-400"
                                                        : "text-gray-400 border-gray-400 dark:text-gray-500 dark:border-gray-500"
                                                    }`}
                                            >
                                                {isCompleted ? "Completed" : "Pending"}
                                            </Badge>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
