import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const MOCK_TEST_API = "http://localhost:3001/api/mocktests";

export const mockTestApi = createApi({
  reducerPath: "mockTestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: MOCK_TEST_API,
    credentials: "include", // ✅ include cookies for auth
  }),
  tagTypes: ["MockTests"], // ✅ tag for cache invalidation
  endpoints: (builder) => ({
    startMockTest: builder.mutation({
      query: ({ courseId, courseTitle }) => ({
        url: "/start",
        method: "POST",
        body: { courseId, courseTitle },
      }),
      invalidatesTags: ["MockTests"],
    }),
    saveAnswer: builder.mutation({
      query: ({ sessionId, questionIndex, selectedIndex }) => ({
        url: "/answer",
        method: "POST",
        body: { sessionId, questionIndex, selectedIndex },
      }),
      invalidatesTags: ["MockTests"],
    }),
    submitMockTest: builder.mutation({
      query: ({ sessionId }) => ({
        url: "/submit",
        method: "POST",
        body: { sessionId },
      }),
      invalidatesTags: ["MockTests"],
    }),
    getMockSession: builder.query({
      query: (sessionId) => ({
        url: `/${sessionId}`,
        method: "GET",
      }),
      providesTags: ["MockTests"],
    }),
    getLastMockTest: builder.query({
      query: (courseId) => `/last/${courseId}`,
      providesTags: (_r, _e, courseId) => [
        { type: "MockTest", id: "LAST" },
        { type: "MockTest", id: courseId },
      ],
      transformResponse: (response) => response, // keep { data: {...} } shape
    }),
  }),
});

export const {
  useStartMockTestMutation,
  useSaveAnswerMutation,
  useSubmitMockTestMutation,
  useGetMockSessionQuery,
   useGetLastMockTestQuery,
} = mockTestApi;
