// Pages/Admin/lecture/CreateLecture.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/Features/api/courseApi";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const MEDIA_API = "http://localhost:3001/api/media";

export default function CreateLecture() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [lectureTitle, setLectureTitle] = useState("");
  const [isPreviewFree, setIsPreviewFree] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);

  const [createLecture, { isLoading, isSuccess, error }] =
    useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery({ courseId });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Lecture created successfully.");
      // ✅ clear form inputs after creating lecture
      setLectureTitle("");
      setVideoInfo(null);
      setUploadProgress(0);
      setIsPreviewFree(false);
      // ✅ refetch lectures list
      refetch();
    }
    if (error) {
      toast.error(error?.data?.message || "Something went wrong.");
    }
  }, [isSuccess, error, refetch]);

  const handleBack = () => {
    navigate(`/admin/course/${courseId}`);
  };

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setMediaUploading(true);
      setUploadProgress(0);

      const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
        onUploadProgress: ({ loaded, total }) => {
          setUploadProgress(Math.round((loaded * 100) / total));
        },
      });

      if (res.data.success) {
        setVideoInfo({
          videoUrl: res.data.data.url,
          publicId: res.data.data.public_id,
        });
        toast.success("Video uploaded successfully");
      } else {
        toast.error("Video upload failed");
      }
    } catch (err) {
      toast.error("Error uploading video");
    } finally {
      setMediaUploading(false);
    }
  };

  const handleCreate = () => {
    if (!lectureTitle.trim()) {
      toast.error("Lecture title is required.");
      return;
    }
    if (!courseId) {
      toast.error("Course ID is missing.");
      return;
    }
    if (!videoInfo) {
      toast.error("Please upload a video before creating the lecture.");
      return;
    }

    createLecture({
      courseId,
      lectureTitle,
      videoUrl: videoInfo.videoUrl,
      publicId: videoInfo.publicId,
      isPreviewFree,
    });
  };

  const updateLectures = (lectureId) => {
    navigate(`/admin/course/${courseId}/lecture/${lectureId}`);
  };

  // ✅ Animations
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground py-5 sm:px-10 lg:px-32"
    >
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-5xl font-bold mb-3">
            Let’s add lectures
          </h1>
          <p className="text-muted-foreground text-lg">
            Fill in the details to create a new lecture.
          </p>
        </motion.div>

        {/* Lecture Title */}
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
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
          />
        </motion.div>

        {/* Video Upload */}
        <div className="space-y-2">
          <Label className="text-base">Upload Lecture Video</Label>
          <Input type="file" accept="video/*" onChange={fileChangeHandler} />
          {mediaUploading && (
            <p className="text-sm text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          )}
          {videoInfo && (
            <video
              src={videoInfo.videoUrl}
              controls
              className="w-full mt-2 rounded-lg"
            />
          )}
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPreviewFree}
            onChange={() => setIsPreviewFree((prev) => !prev)}
          />
          <span>Make Preview Free</span>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <Button variant="outline" onClick={handleBack}>
            Back to Course
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
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
        <h2 className="text-2xl sm:text-4xl font-bold mb-10 text-primary">
          Existing Lectures
        </h2>

        {lectureLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        )}

        {lectureError && (
          <p className="text-center text-red-500">
            Failed to load lectures. Try again.
          </p>
        )}

        {!lectureLoading && lectureData?.lectures?.length === 0 && (
          <div className="text-center space-y-4 mt-10">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="No Lectures"
              className="mx-auto h-40 opacity-70 dark:opacity-50"
            />
            <p className="text-xl font-medium text-muted-foreground">
              No lectures available
            </p>
          </div>
        )}

        {!lectureLoading && lectureData?.lectures?.length > 0 && (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {lectureData.lectures.map((lecture, index) => (
              <motion.div
                key={lecture._id}
                variants={itemVariants}
                className="border rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-lg"
              >
                <h3 className="text-lg sm:text-xl font-semibold">
                  Lecture-{index + 1}: {lecture.lectureTitle}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => updateLectures(lecture._id)}
                  className="flex items-center gap-1 text-sm"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
