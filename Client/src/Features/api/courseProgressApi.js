import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL =
  import.meta.env.VITE_RENDER_URL ||
  import.meta.env.VITE_LOCALHOST_URL;

const COURSE_PROGRESS_API = `${BACKEND_URL}/api/progress`;


export const courseProgressApi = createApi({
    reducerPath: "courseProgressApi",
    baseQuery: fetchBaseQuery({
        baseUrl: COURSE_PROGRESS_API,
        credentials: "include",
        // ✅ Add prepareHeaders here too just in case
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // ... (Keep existing endpoints)
        getCourseProgress: builder.query({
            query: (courseId) => ({
                url: `/${courseId}`,
                method: "GET",
            }),
        }),
        updateLectureProgress: builder.mutation({
            query: ({ courseId, lectureId }) => ({
                url: `/${courseId}/lecture/${lectureId}/view`,
                method: "POST",
            }),
        }),
        completeCourse: builder.mutation({
            query: (courseId) => ({
                url: `/${courseId}/complete`,
                method: "POST",
            }),
        }),
        incompleteCourse: builder.mutation({
            query: (courseId) => ({
                url: `/${courseId}/incomplete`,
                method: "POST",
            }),
        }),
    }),
});

export const {
    useGetCourseProgressQuery,
    useUpdateLectureProgressMutation,
    useCompleteCourseMutation,
    useIncompleteCourseMutation,
} = courseProgressApi;