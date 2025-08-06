import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGetCreatorCoursesQuery } from "@/Features/api/courseApi";

export default function CourseTable() {
  const { data, isLoading } = useGetCreatorCoursesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const navigate = useNavigate();
  if (isLoading) return <h1>Loading...</h1>

  return (
    <div className="h-screen w-full bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors px-4 py-6 md:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-5">
        <Button onClick={() => navigate('create')}>Create a New Course</Button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-[calc(100%-80px)] overflow-x-auto"
      >
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3 text-left">Title</TableHead>
              <TableHead className="px-6 py-3 text-left">Price</TableHead>
              <TableHead className="px-6 py-3 text-left">Status</TableHead>
              <TableHead className="px-6 py-3 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.courses.map((course) => (
              <TableRow key={course._id} className="hover:bg-muted/50">
                <TableCell className="px-6 py-4">{course.courseTitle}</TableCell>
                <TableCell className="px-6 py-4">{course?.coursePrice || "Free"}</TableCell>
                <TableCell className="px-6 py-4">
                  <Badge
                    className={
                      course.isPublished
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => navigate(`${course._id}`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
