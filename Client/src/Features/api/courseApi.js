import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ CHANGE: Use Render Backend URL
const COURSE_API = "https://lms-project-1-38j4.onrender.com/api/course";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["Refetch_Creator_Course","Refetch_Lecture"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_API,
    credentials: "include",
    // ✅ CRITICAL ADDITION: Attach Token to Header
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token; // Ensure authSlice has 'token'
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
  }),
  endpoints: (builder) => ({
    // ... (Keep ALL endpoints exactly as they were in your code) ...
    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "/",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    getSearchCourse: builder.query({
      query: ({searchQuery, categories, sortByPrice}) => {
        let queryString = `/search?query=${encodeURIComponent(searchQuery)}`
        if(categories && categories.length > 0){
          const categoriesString = categories.map(encodeURIComponent).join(",");
          queryString += `&categories=${categoriesString}`;
        }
        if(sortByPrice){
          queryString +=  `&sortByPrice=${encodeURIComponent(sortByPrice)}`;
        }
        return {
          url : queryString,
          method:"GET",
        }
      }
    }),
    getPublishedCourse: builder.query({
      query: () => ({
        url: "/published-courses",
        method: "GET",
      }),
    }),
    getCreatorCourses: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Refetch_Creator_Course"],
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    createLecture: builder.mutation({
      query: ({ courseId, lectureTitle, videoUrl, publicId, isPreviewFree }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle, videoUrl, publicId, isPreviewFree },
      }),
      invalidatesTags: ["Lecture"]
    }),
    getCourseLecture: builder.query({
      query: ({ courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags:["Lecture"]
    }),
    editLecture: builder.mutation({
      query: ({lectureTitle, videoInfo , isPreviewFree, courseId, lectureId}) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method:"POST",
        body : {lectureTitle, videoInfo , isPreviewFree}
      })
    }),
    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method:"DELETE",
      }),
      invalidatesTags:["Refetch_Lecture"]
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method:"GET",
      }),
    }),
    publishCourse: builder.mutation({
      query: ({courseId, query}) => ({
        url: `/${courseId}?publish=${query}`,
        method:"PATCH",
      }),
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCoursesQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation
} = courseApi;