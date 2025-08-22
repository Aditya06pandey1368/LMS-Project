import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSearchCourseQuery } from "@/Features/api/courseApi";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

// Categories list (key = value stored in DB, label = shown to user)
const categories = [
  { key: "android", label: "Android Development" },
  { key: "ds", label: "Database" },
  { key: "database", label: "Data Science" },
  { key: "dsa", label: "Data Structures & Algorithms" },
  { key: "git", label: "Git and GitHub" },
  { key: "java", label: "Java" },
  { key: "ml", label: "Machine Learning" },
  { key: "python", label: "Python" },
  { key: "uiux", label: "UI/UX Design" },
  { key: "webdev", label: "Web Development" },
];

// Helpers
const priceToNumber = (p) => {
  if (p === null || p === undefined || p === "" || p === "Free") return 0;
  if (typeof p === "number") return p;
  const n = Number(String(p).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const getLevelClasses = (level) => {
  const val = String(level || "").toLowerCase();
  if (val.includes("beginner")) return "bg-green-600 text-white";
  if (val.includes("intermediate")) return "bg-yellow-500 text-gray-900";
  return "bg-red-600 text-white";
};

// Framer Motion variants
const shellVariants = {
  hiddenLeft: { opacity: 0, x: -40 },
  hiddenRight: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 70, damping: 18 } },
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } },
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortByPrice, setSortByPrice] = useState("");

  const { data, isLoading } = useGetSearchCourseQuery({
    searchQuery: query,
    sortByPrice,
  });

  const courses = data?.courses || [];

  // ✅ Filter courses by category (handles string or array, case-insensitive)
  const filteredCourses = useMemo(() => {
    if (!selectedCategory) return courses;

    return courses.filter((course) => {
      const cat = course.category;
      if (Array.isArray(cat)) {
        return cat.some((c) =>
          c.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }
      return String(cat || "")
        .toLowerCase()
        .includes(selectedCategory.toLowerCase());
    });
  }, [courses, selectedCategory]);

  // ✅ Apply sorting
  const sortedCourses = useMemo(() => {
    const arr = [...filteredCourses];
    if (sortByPrice === "price_low_high") {
      arr.sort((a, b) => priceToNumber(a?.coursePrice) - priceToNumber(b?.coursePrice));
    } else if (sortByPrice === "price_high_low") {
      arr.sort((a, b) => priceToNumber(b?.coursePrice) - priceToNumber(a?.coursePrice));
    }
    return arr;
  }, [filteredCourses, sortByPrice]);

  const isEmpty = !isLoading && sortedCourses.length === 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 pl-4 pr-4 pt-18 md:pl-5 md:pr-2 md:pt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
        
        {/* Left Section - Filters */}
        <motion.aside
          className="md:col-span-1 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl shadow-sm overflow-y-auto"
          initial="hiddenLeft"
          animate="show"
          variants={shellVariants}
        >
          <h2 className="text-2xl font-semibold mb-2">Filter</h2>

          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">Sort courses by price</div>
          <Select value={sortByPrice} onValueChange={setSortByPrice}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_low_high">Price: Low to High</SelectItem>
              <SelectItem value="price_high_low">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Separator className="my-4" />

          <h3 className="text-md font-semibold mb-2">Category</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.key}
                className="flex items-center space-x-2 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.key}
                  checked={selectedCategory === cat.key}
                  onChange={() => setSelectedCategory(cat.key)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="text-sm font-medium leading-none">{cat.label}</span>
              </label>
            ))}
          </div>
        </motion.aside>

        {/* Right Section - Courses */}
        <motion.section
          className="md:col-span-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl shadow-sm overflow-y-auto"
          initial="hiddenRight"
          animate="show"
          variants={shellVariants}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              {query ? (
                <p className="text-lg">
                  Showing results for <span className="font-semibold">"{query}"</span>
                </p>
              ) : (
                <p className="text-lg font-semibold">All Courses</p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isLoading
                  ? "Loading…"
                  : `${sortedCourses.length} result${sortedCourses.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="text-xs md:text-sm">
              Current sort:{" "}
              {sortByPrice
                ? sortByPrice === "price_low_high"
                  ? "Low → High"
                  : "High → Low"
                : "None"}
            </div>
          </div>

          {/* Cards */}
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {isEmpty && (
              <div className="flex flex-col items-center justify-center py-10">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/6195/6195678.png" // 👉 Put your image inside public/
                  alt="No courses"
                  className="w-60 h-60 object-contain mb-4 opacity-90"
                />
                <p className="text-gray-500 text-lg font-medium">
                  Oops! No courses match this filter. Try another one ✨
                </p>
              </div>
            )}

            {sortedCourses.map((course) => (
              <motion.div key={course._id} variants={cardVariants} whileHover={{ scale: 1.01 }}>
                <Card className="flex flex-col md:flex-row overflow-hidden mb-0 border border-gray-200/60 dark:border-gray-800/60 hover:shadow-md transition-shadow">
                  
                  {/* Thumbnail */}
                  <Link to={`/course-detail/${course._id}`} className="md:w-1/3">
                    <div className="bg-gray-200 dark:bg-gray-800 flex items-center justify-center h-40 w-full">
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <CardContent className="md:w-2/3 flex flex-col justify-center p-4 gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold line-clamp-1">{course.courseTitle}</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {course.subTitle}
                        </p>
                        <p className="mt-1 mb-1 text-xs text-gray-500 dark:text-gray-400">
                          Instructor : {course.creator?.name || "Unknown"}
                        </p>
                        <Badge className={getLevelClasses(course.courseLevel)}>
                          {course.courseLevel || "Advanced"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Price : {course.coursePrice ? `₹${priceToNumber(course.coursePrice)}` : "Free"}
                      </p>
                      <Link
                        to={`/course-detail/${course._id}`}
                        className="inline-flex items-center rounded-xl px-3 py-1.5 text-sm font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                      >
                        View details
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
