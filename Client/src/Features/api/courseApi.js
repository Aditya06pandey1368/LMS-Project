// Features/api/courseApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_API = "http://localhost:3001/api/course";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["Refetch_Creator_Course","Refetch_Lecture"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
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
        //Build query string
        let queryString = `/search?query=${encodeURIComponent(searchQuery)}`

        //append category
        if(categories && categories.length > 0){
          const categoriesString = categories.map(encodeURIComponent).join(",");
          queryString += `&categories=${categoriesString}`;
        }

        //append sort by price
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

    // ✅ Updated createLecture mutation
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
