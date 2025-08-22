import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetPurchasedCoursesQuery } from "@/Features/api/purchaseApi";

export default function Dashboard() {
  const { data, isLoading, isError } = useGetPurchasedCoursesQuery();

  console.log("API Response 👉", data); // ✅ check actual backend response

  if (isLoading) return <h1 className="text-center">Loading...</h1>;
  if (isError) return <h1 className="text-center">Failed to get purchased courses.</h1>;

  // Extract purchased courses from API response and ensure it's always an array
  const purchasedCourse = Array.isArray(data?.purchasedCourse) ? data.purchasedCourse : [];

  // Prepare chart data
  const courseData = purchasedCourse.map((purchase) => ({
    name: purchase?.courseId?.courseTitle || "Untitled",
    price: purchase?.amount || purchase?.courseId?.coursePrice || 0, // ✅ use purchase.amount
  }));

  // Total revenue = sum of all purchase amounts
  const totalRevenue = purchasedCourse.reduce(
    (sum, purchase) => sum + (purchase.amount || purchase.courseId?.coursePrice || 0),
    0
  );
  console.log(totalRevenue);
  console.log(purchasedCourse.length);

  return (
    <div className="p-6 space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Sales */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{purchasedCourse.length}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Revenue */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{totalRevenue}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Purchased Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="price" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
