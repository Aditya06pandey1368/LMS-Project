import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const CourseCard = ({ course }) => {
  const getLevelColor = () => {
    switch (course.courseLevel) {
      case "Beginner": return "bg-green-500 text-white";
      case "Intermediate": return "bg-yellow-500 text-white";
      case "Advanced": return "bg-red-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Card className="shadow-md hover:shadow-xl transition-all dark:bg-gray-800 p-0">
        <img
          src={course.courseThumbnail}
          alt={"Course Image"}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <CardContent className="space-y-2 p-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.courseTitle}</h3>
          <Badge className={getLevelColor()}>{course.courseLevel}</Badge>
          <p className="text-sm text-gray-600 dark:text-gray-300">By {course.creator?.name}</p>
          <p className="text-md font-semibold text-indigo-600 dark:text-indigo-400">{course.coursePrice ? '₹' + course.coursePrice : "Free"}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
