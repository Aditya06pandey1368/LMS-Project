import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, Lock, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCourseDetailWithStatusQuery } from "@/Features/api/purchaseApi";
import BuyCourseButton from "./BuyCourseButton";

export default function CourseDetail() {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetCourseDetailWithStatusQuery(courseId);

  // 🔹 State to track which preview video is currently playing
  const [currentPreview, setCurrentPreview] = useState(null);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Failed to load course details</h1>;

  const { course, purchased } = data;

  const handleContinueCourse = () => {
  if (
    purchased || 
    course.coursePrice === undefined || 
    course.coursePrice === "Free" || 
    course.coursePrice === 0
  ) {
    navigate(`/course-progress/${courseId}`);
  }
};


  // 🔹 Handle preview selection
  const handlePreviewClick = (lecture) => {
    if (lecture.isPreviewFree) {
      setCurrentPreview(lecture); // only update if it's a free preview
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-gray-900 dark:text-white p-6 md:p-10 space-y-10 transition-colors duration-500">
      {/* Section 1 */}
      <motion.section
        className="space-y-2"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-3xl md:text-5xl bg-gradient-to-r font-bold from-indigo-500 via-purple-500 to-pink-500
             bg-clip-text text-transparent pt-12 pb-2">{course.courseTitle}</h1>
        <p className="text-xl text-muted-foreground">{course.subTitle}</p>
        <p className="text-sm">
          Created by <span className="font-semibold">{course.creator.name}</span>
        </p>
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-2 py-1">
              <Info className="h-3 w-3 mr-1" /> Last updated {course?.createdAt.split("T")[0]}
            </Badge>
          </span>
          <span>•</span>
          <span>Students enrolled : {course?.enrolledStudents.length}</span>
        </div>
      </motion.section>

      {/* Section 2 */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Section 2a - Course Content */}
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {course.description && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Description</h2>
              <p
                className="text-base text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>
          )}

          {/* Course Content Card */}
          <Card className="bg-muted/10 dark:bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">Course Content</CardTitle>
              <CardDescription>{course.lectures.length} lectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture) => (
                <div
                  key={lecture._id}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handlePreviewClick(lecture)}
                >
                  {lecture.isPreviewFree ? (
                    <PlayCircle
                      className={`${
                        currentPreview?._id === lecture._id
                          ? "text-green-700"
                          : "text-green-500"
                      }`}
                    />
                  ) : (
                    <Lock className="text-red-500" />
                  )}
                  <span>{lecture.lectureTitle}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 2b - Video Player */}
        <motion.div
          className="lg:w-1/3 space-y-4"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Card className="overflow-hidden">
            {currentPreview?.videoUrl ? (
              <div className="aspect-video bg-gray-200 dark:bg-gray-900 relative pl-6 pr-6">
                <video
                  src={currentPreview.videoUrl}
                  controls
                  style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-gray-400 dark:text-gray-600">
                Select a free preview lecture to watch
              </div>
            )}

            <CardContent>
              <p className="text-lg font-semibold">{course.courseTitle}</p>
              <Separator className="mb-3" />
              <div className="flex items-center justify-between flex-wrap">
                <span className="text-xl font-bold">
                  {course.coursePrice > 0 ? course.coursePrice : "Free"}
                </span>
                {(purchased ||
                  course.coursePrice === undefined ||
                  course.coursePrice === "Free" || course.coursePrice=== 0) ? (
                  <Button onClick={handleContinueCourse}>Continue Course</Button>
                ) : (
                  <BuyCourseButton courseId={courseId} />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
