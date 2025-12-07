import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ CHANGE: Use Render Backend URL
const MOCK_TEST_API = "https://lms-project-1-38j4.onrender.com/api/mocktests";

export const mockTestApi = createApi({
  reducerPath: "mockTestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: MOCK_TEST_API,
    credentials: "include",
    // ✅ Add prepareHeaders
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
  }),
  tagTypes: ["MockTests"],
  endpoints: (builder) => ({
    // ... (Keep existing endpoints)
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
      transformResponse: (response) => response, 
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