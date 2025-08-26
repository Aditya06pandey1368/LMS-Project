import { useGetCourseDetailWithStatusQuery } from "@/Features/api/purchaseApi";
import { useParams, Navigate } from "react-router-dom";

const PurchaseCourseProtectedRoute = ({ children }) => {
    const { courseId } = useParams();
    const { data, isLoading } = useGetCourseDetailWithStatusQuery(courseId);
    console.log(data);

    if (isLoading) return <h1>Loading...</h1>

    return data?.course?.coursePrice
        ? (data?.purchased
            ? children
            : <Navigate to={`/course-detail/${courseId}`} />)
        : children;
}

export default PurchaseCourseProtectedRoute;