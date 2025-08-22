import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API = "http://localhost:3001/api/course-purchase"

export const purchaseApi = createApi({
    reducerPath:"purchaseApi",
    baseQuery:fetchBaseQuery({
        baseUrl:COURSE_PURCHASE_API,
        credentials:'include'
    }),
    tagTypes: ["PurchasedCourses"], // ✅ declare tag type
    endpoints:(builder) => ({
        createCheckoutSession : builder.mutation({
            query:(courseId) => ({
                url:"/create-checkout-session",
                method:"POST",
                body:{courseId}
            }),
            invalidatesTags: ["PurchasedCourses"], // ✅ tell RTK to refresh purchased courses
        }),
        getCourseDetailWithStatus: builder.query({
            query:(courseId) => ({
                url:`/course/${courseId}/detail-with-status`,
                method:"GET"
            })
        }),
        getPurchasedCourses:builder.query({
            query:() => ({
                url:"/",
                method:"GET",
            }),
            providesTags: ["PurchasedCourses"], // ✅ enables auto refresh
        })
    })
})

export const { 
  useCreateCheckoutSessionMutation, 
  useGetCourseDetailWithStatusQuery, 
  useGetPurchasedCoursesQuery 
} = purchaseApi;
