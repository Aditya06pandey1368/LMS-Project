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

export default function AddCourse() {
    const [courseTitle, setCourseTitle] = useState("");
    const [category, setCategory] = useState("");

    const [createCourse, { data, isLoading, error, isSuccess }] = useCreateCourseMutation();

    const navigate = useNavigate();

    const getSelectedCategory = (value) => {
        setCategory(value);
    }
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
        <div className="max-w-2xl mx-auto px-10 py-8 space-y-6">
            {/* Page Heading */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-15">
                Add a New Course
            </h1>

            {/* Title */}
            <div className="space-y-2">
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
            </div>

            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category" className="text-lg">
                    Category
                </Label>
                <Select onValueChange={getSelectedCategory}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-white">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800">
                        <SelectItem value="webdev">Web Development</SelectItem>
                        <SelectItem value="dsa">Data Structures & Algorithms</SelectItem>
                        <SelectItem value="ml">Machine Learning</SelectItem>
                        <SelectItem value="uiux">UI/UX Design</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-5">
                <Button variant="outline" onClick={() => navigate("/admin/course")}>Back</Button>
                <Button disabled={isLoading} onClick={createCourseHandler}>
                    {
                        isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please Wait
                            </>
                        ) : "Create"
                    }
                </Button>
            </div>
        </div>
    );
}
