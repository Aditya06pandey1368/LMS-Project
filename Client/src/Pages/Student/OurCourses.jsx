import { useRef, useEffect } from "react";
import { useGetPublishedCourseQuery } from "@/Features/api/courseApi";
import CourseCard from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useScroll, useTransform } from "framer-motion";

const OurCourses = () => {
  const { data, isLoading, isError } = useGetPublishedCourseQuery();
  const ref = useRef(null);

  // Top entry animation
  const { scrollYProgress: topScroll } = useScroll({
    target: ref,
    offset: ["start 0.9", "start start"],
  });
  const topScale = useTransform(topScroll, [0, 1], [0.85, 1]);
  const topOpacity = useTransform(topScroll, [0, 1], [0.5, 1]);

  // Bottom exit animation
  const { scrollYProgress: bottomScroll } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bottomScale = useTransform(bottomScroll, [0, 1], [1, 0.9]);
  const bottomOpacity = useTransform(bottomScroll, [0, 1], [1, 0.6]);

  // Merge both animations
  const finalScale = useTransform([topScale, bottomScale], ([t, b]) => t * b);
  const finalOpacity = useTransform([topOpacity, bottomOpacity], ([t, b]) => t * b);

  useEffect(() => {
    const timer = setTimeout(() => { }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isError) return <h1>Some error has occurred</h1>;

  return (
    <motion.section
      ref={ref}
      style={{
        scale: finalScale,
        opacity: finalOpacity,
      }}
      className="px-10 py-10 min-h-screen bg-white dark:bg-gray-900"
    >
      <h2 className="text-3xl md:text-4xl xl:text-5xl py-3 font-extrabold text-center mb-12 mt-5 tracking-tight leading-tight">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
          Discover Courses That Shape Careers
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))
          : data?.courses &&
          data.courses.map((course, index) => (
            <CourseCard key={index} course={course} {...course} />
          ))}
      </div>
    </motion.section>
  );
};

export default OurCourses;
