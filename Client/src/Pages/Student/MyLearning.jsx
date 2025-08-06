import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CourseCard from "./CourseCard"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

const myCourses = []


const MyLearning = () => {
  const [loading, setLoading] = useState(true)
  const [enrolledCourses, setEnrolledCourses] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setEnrolledCourses(myCourses) // simulate fetching enrolled courses
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="px-10 py-10 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10 mt-20">
        My Learning
      </h2>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 text-lg">
          Loading your courses...
        </div>
      ) : enrolledCourses.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-6"
        >
          <BookOpen className="w-16 h-16 text-indigo-500 dark:text-indigo-400" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            You haven’t applied for any courses yet.
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 transition">
            Explore Courses
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {enrolledCourses.map((course, index) => (
            <CourseCard key={index} {...course} course={course} />
          ))}
        </motion.div>
      )}
    </section>
  )
}

export default MyLearning;
