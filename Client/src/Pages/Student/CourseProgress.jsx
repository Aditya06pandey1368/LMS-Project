import React, { useState, useEffect } from "react"; // Added useEffect for a better pattern
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CirclePlay } from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useCompleteCourseMutation, useGetCourseProgressQuery, useIncompleteCourseMutation, useUpdateLectureProgressMutation } from "@/Features/api/courseProgressApi";
import { useParams } from "react-router-dom";

// This is fine as a fallback, but the state should come from your API data  
const initialLectures = [
    { title: "Introduction", isCompleted: true },
    { title: "Setting VS code", isCompleted: false },
    { title: "First project", isCompleted: false },
    { title: "End of the Course", isCompleted: false },
];

export default function CourseProgress() {
    // --- ALL HOOKS MUST BE AT THE TOP ---
    const params = useParams();
    const courseId = params.courseId;
    const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(
        courseId
    );
    const [updateLectureProgress] = useUpdateLectureProgressMutation();
    const [completeCourse, {data:markCompleteData, isSuccess:completedSuccess}] = useCompleteCourseMutation();
    const [incompleteCourse, {data:markIncompleteData, isSuccess:incompletedSuccess}] = useIncompleteCourseMutation();

    // MOVED these useState hooks up here, before any conditions or returns
    const [lectures, setLectures] = useState([]); // Start with empty array
    const [allCompleted, setAllCompleted] = useState(false);

    // Use useEffect to update state when your API data arrives
    useEffect(() => {
        if (data && data.data) {
            const { courseDetails, completed } = data.data;
            // Assuming courseDetails.lectures is an array of lecture objects
            // And each lecture in your API response has an 'isCompleted' property
            setLectures(courseDetails.lectures || []);
            setAllCompleted(completed || false);
        }
    }, [data]); // This effect runs whenever 'data' changes

    const [currentLecture, setCurrentLecture] = useState(null);

    // --- CONDITIONAL RETURNS GO AFTER ALL HOOKS ---
    if (isLoading) return <h1>Loading...</h1>;
    if (isError || !data || !data.data) return <h1>Error loading course data.</h1>;

    // Now it's safe to destructure, since we know data exists
    const { courseDetails, progress, completed } = data.data;
    const { courseTitle } = courseDetails;

    //initialize the first lecture is not exist
    const initialLecture = currentLecture || courseDetails.lectures && courseDetails.lectures[0];

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

    const isLectureCompleted = (lectureId) => {
        return progress.some((prog) => prog.lectureId === lectureId && prog.viewed)
    }
    const handleLectureProgress = async (lectureId) => {
        await updateLectureProgress({courseId, lectureId});
        refetch();
    }

    //Handle select a specific lecture to watch
    const handleSelectLecture = (lecture) => {
        setCurrentLecture(lecture);
        handleLectureProgress(lecture._id);
    }


    const handleCompleteCourse = async () => {
        await completeCourse(courseId);
        refetch();
    }

    const handleIncompleteCourse = async () => {
        await incompleteCourse(courseId);
        refetch();
    }

    return (
        <>
            <Toaster position="bottom-right" />
            <div className="min-h-screen pt-20 p-6 bg-white dark:bg-gray-950 transition-colors duration-500">
                <div className="w-full md:p-10 mx-auto flex flex-col md:flex-row gap-20">
                    {/* Section A */}
                    <section className="md:w-1/2 flex flex-col gap-9">
                        <h1 className="md:text-5xl text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {courseTitle}
                        </h1>
                        <Card className="p-5 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                            <div className="bg-gray-200 dark:bg-gray-800 aspect-video rounded-md shadow-inner flex items-center justify-center text-gray-400 dark:text-gray-500 select-none">
                                <video
                                    src={currentLecture?.videoUrl || initialLecture.videoUrl}
                                    controls
                                    className="w-full h-auto md:rounded-lg"
                                    onPlay={() => handleLectureProgress(currentLecture?._id || initialLecture._id)}
                                />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                {
                                    `Lecture ${courseDetails.lectures.findIndex((lec) => lec._id === (currentLecture?.id || initialLecture._id)) + 1} : ${currentLecture?.lectureTitle || initialLecture?.lectureTitle}`
                                }
                            </h3>
                        </Card>
                    </section>

                    {/* Section B */}
                    <section className="md:w-1/2 flex mt-5 flex-col gap-6">
                        <Button
                            onClick={completed? handleIncompleteCourse : handleCompleteCourse}
                            className={`self-start ${allCompleted
                                ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                } text-white transition-colors`}
                        >
                            {completed ? "Mark as incomplete" : "Mark as completed"}
                        </Button>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Course Lectures
                        </h2>

                        <div className="flex flex-col gap-4">
                            {lectures.map((lecture) => ( // Corrected map syntax
                                <motion.div
                                    key={lecture._id}
                                    whileHover={{ scale: 1.05 }}
                                    className="cursor-pointer"
                                >
                                    <Card className={`flex justify-between px-6 py-4 w-full ${lecture._id === currentLecture?._id ? 'bg-gray-500' :' dark:bg-gray-900'}`} onClick={() => handleSelectLecture(lecture)}>
                                        <div className="flex justify-between gap-3">
                                            <div className="flex gap-2">
                                                {isLectureCompleted(lecture._id) ? (
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
                                                    {lecture.lectureTitle}
                                                </CardTitle>
                                            </div>
                                            {
                                                isLectureCompleted(lecture._id) && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`${isLectureCompleted(lecture._id)
                                                            ? "text-green-700 border-green-700 dark:text-green-400 dark:border-green-400"
                                                            : "text-gray-400 border-gray-400 dark:text-gray-500 dark:border-gray-500"
                                                            }`}
                                                    >
                                                        {isLectureCompleted(lecture._id) ? "Completed" : "Pending"}
                                                    </Badge>
                                                )
                                            }
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