import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL =
  import.meta.env.VITE_RENDER_URL ||
  import.meta.env.VITE_LOCALHOST_URL;

const COURSE_PURCHASE_API = `${BACKEND_URL}/api/course-purchase`;


export const purchaseApi = createApi({
    reducerPath:"purchaseApi",
    baseQuery:fetchBaseQuery({
        baseUrl:COURSE_PURCHASE_API,
        credentials:'include',
        // ✅ CRITICAL ADDITION
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["PurchasedCourses"],
    endpoints:(builder) => ({
        createCheckoutSession : builder.mutation({
            query:(courseId) => ({
                url:"/create-checkout-session",
                method:"POST",
                body:{courseId}
            }),
            invalidatesTags: ["PurchasedCourses"],
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
            providesTags: ["PurchasedCourses"],
        })
    })
})

export const { 
  useCreateCheckoutSessionMutation, 
  useGetCourseDetailWithStatusQuery, 
  useGetPurchasedCoursesQuery 
} = purchaseApi;