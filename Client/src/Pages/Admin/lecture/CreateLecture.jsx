// Pages/Admin/lecture/CreateLecture.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLectureMutation, useGetCourseLectureQuery } from "@/Features/api/courseApi";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateLecture() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [lectureTitle, setLectureTitle] = useState("");
  const [isPreviewFree, setIsPreviewFree] = useState(false);

  const [createLecture, { data, isLoading, isSuccess, error }] = useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery({ courseId });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Lecture created successfully.");
      setLectureTitle("");
      refetch();
    }
    if (error) {
      toast.error(error?.data?.message || "Something went wrong.");
    }
  }, [isSuccess, error]);

  const handleBack = () => {
    navigate("/admin/course");
  };

  const handleCreate = () => {
    if (!lectureTitle) {
      toast.error("Lecture title is required.");
      return;
    }
    if (!courseId) {
      toast.error("Course ID is missing.");
      return;
    }

    createLecture({
      courseId,
      lectureTitle,
      videoUrl: "https://cloudinary.com/demo-video.mp4",
      publicId: "cloudinary-public-id",
      isPreviewFree,
    });
  };

  const updateLectures = (lectureId) => {
    navigate(`/admin/course/${courseId}/lecture/${lectureId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground px-4 py-10 sm:px-10 lg:px-32"
    >
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Let’s add lectures</h1>
          <p className="text-muted-foreground text-lg">
            Fill in the basic details to create a new lecture.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="title" className="text-base">
            Lecture Title
          </Label>
          <Input
            id="title"
            placeholder="Enter the lecture title"
            className="w-full"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
          />
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleBack}>
            Back to Course
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Lecture"}
          </Button>
        </motion.div>
      </div>

      {/* Existing Lectures */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-32"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-primary">
          Existing Lectures
        </h2>

        {lectureLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        )}

        {lectureError && (
          <p className="text-center text-red-500">Failed to load lectures. Try again.</p>
        )}

        {!lectureLoading && lectureData?.lectures?.length === 0 && (
          <div className="text-center space-y-4 mt-10">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="No Lectures"
              className="mx-auto h-40 opacity-70 dark:opacity-50"
            />
            <p className="text-xl font-medium text-muted-foreground">No lectures available</p>
          </div>
        )}

        {!lectureLoading && lectureData?.lectures?.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="space-y-4"
          >
            {lectureData.lectures.map((lecture, index) => (
              <motion.div
                key={lecture._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <h3 className="text-lg sm:text-xl font-semibold">
                  Lecture-{index + 1}: {lecture.lectureTitle}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => updateLectures(lecture._id)}
                  className="flex items-center gap-1 text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
