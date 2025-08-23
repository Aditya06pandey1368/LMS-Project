import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useCreateCourseMutation } from "@/Features/api/courseApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AddCourse() {
    const [courseTitle, setCourseTitle] = useState("");
    const [category, setCategory] = useState("");

    const [createCourse, { data, isLoading, error, isSuccess }] = useCreateCourseMutation();

    const navigate = useNavigate();

    const getSelectedCategory = (value) => {
        setCategory(value);
    };

    const createCourseHandler = async () => {
        await createCourse({ courseTitle, category });
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Course created successfully");
            navigate("/admin/course");
        }
        if (error) {
            console.error("Create course error:", error);
            toast.error(error?.data?.message || "Something went wrong");
        }
    }, [isSuccess, error]);

    return (
        <motion.div
            className="max-w-2xl mx-auto px-10 py-8 space-y-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Page Heading */}
            <motion.h1
                className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-15"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                Add a New Course
            </motion.h1>

            {/* Title */}
            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <Label htmlFor="title" className="text-lg">
                    Title
                </Label>
                <Input
                    id="title"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="Enter course title"
                    className="bg-white dark:bg-gray-800 dark:text-white"
                />
            </motion.div>

            {/* Category */}
            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                <Label htmlFor="category" className="text-lg">
                    Category
                </Label>
                <Select onValueChange={getSelectedCategory}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-white">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800">
                        <SelectItem value="android">Android Development</SelectItem>
                        <SelectItem value="ds">Database</SelectItem>
                        <SelectItem value="database">Data Science</SelectItem>
                        <SelectItem value="dsa">Data Structures & Algorithms</SelectItem>
                        <SelectItem value="git">Git and GitHub</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="ml">Machine Learning</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="uiux">UI/UX Design</SelectItem>
                        <SelectItem value="webdev">Web Development</SelectItem>
                    </SelectContent>
                </Select>
            </motion.div>

            {/* Buttons */}
            <motion.div
                className="flex justify-between pt-5"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <Button
                    variant="outline"
                    onClick={() => navigate("/admin/course")}
                    className="transition-transform duration-200 hover:scale-105"
                >
                    Back
                </Button>
                <Button
                    disabled={isLoading}
                    onClick={createCourseHandler}
                    className="transition-transform duration-200 hover:scale-105"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please Wait
                        </>
                    ) : (
                        "Create"
                    )}
                </Button>
            </motion.div>
        </motion.div>
    );
}
