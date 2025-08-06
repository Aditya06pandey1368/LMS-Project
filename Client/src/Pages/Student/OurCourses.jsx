import { useEffect, useState } from "react"
import CourseCard from "./CourseCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetPublishedCourseQuery } from "@/Features/api/courseApi"


const OurCourses = () => {
  const { data, isLoading,  isError } = useGetPublishedCourseQuery();
  if (isError) return <h1>Some error has occurred </h1>
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500) // simulate API delay

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="px-10 py-10 min-h-screen bg-white dark:bg-gray-900">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">
        Our Courses
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
          : data?.courses && data.courses.map((course, index) => (
            <CourseCard key={index} course={course} {...course} />
          ))}
      </div>
    </section>
  )
}

export default OurCourses;
