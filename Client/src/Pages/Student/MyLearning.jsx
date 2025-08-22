import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useLoadUserQuery } from "@/Features/api/authApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --------- helpers ----------
const getLevelClasses = (level) => {
  const val = String(level || "").toLowerCase();
  if (val.includes("begin")) return "bg-green-600 text-white";
  if (val.includes("inter")) return "bg-yellow-500 text-gray-900";
  // covers "advanced", "advance", etc.
  if (val.includes("adv")) return "bg-red-600 text-white";
  return "bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white";
};

const CourseSkeleton = () => (
  <Card className="rounded-2xl shadow-md border overflow-hidden">
    <Skeleton className="w-full h-40" />
    <CardContent className="p-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </CardContent>
  </Card>
);

// --------- component ----------
const MyLearning = () => {
  const { data, isLoading } = useLoadUserQuery();
  const myLearning = data?.user?.enrolledCourses || [];
  console.log(data?.user)

  return (
    <section className="px-6 md:px-10 py-10 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10 mt-20">
        My Learnings
      </h2>

      {/* Loading: show skeleton grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CourseSkeleton key={i} />
          ))}
        </div>
      ) : myLearning.length === 0 ? (
        // Empty state
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center justify-center space-y-6"
        >
          <BookOpen className="w-16 h-16 text-indigo-500 dark:text-indigo-400" />
          <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
            You haven’t enrolled in any courses yet.
          </p>
          <Link to={`/course/search?query`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 transition">
              Explore Courses
            </Button>
          </Link>
        </motion.div>
      ) : (
        // Courses grid
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {myLearning.map((course, idx) => {
            const {
              _id,
              courseThumbnail,
              courseTitle,
              subTitle,
              courseLevel,
              creator,
            } = course || {};

            // creator can be an ID string per your sample; show gracefully
            const creatorName =
              typeof creator === "object" && creator?.name
                ? creator.name
                : typeof creator === "string"
                ? "Instructor"
                : "Unknown";

            return (
              <Card
                key={_id || idx}
                className="shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <Link to={`/course-detail/${_id || ""}`}>
                  <img
                    src={
                      courseThumbnail ||
                      "https://via.placeholder.com/640x360?text=Course+Thumbnail"
                    }
                    alt={courseTitle || "Course"}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                </Link>

                <CardContent className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-1">
                    {courseTitle || "Untitled Course"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {subTitle || "No subtitle available."}
                  </p>

                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-300">
                    By {creatorName}
                  </p>

                  <div className="pt-2">
                    <Badge className={getLevelClasses(courseLevel)}>
                      {courseLevel || "Level"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}
    </section>
  );
};

export default MyLearning;
