import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL =
  import.meta.env.VITE_RENDER_URL ||
  import.meta.env.VITE_LOCALHOST_URL;

const MOCK_TEST_API = `${BACKEND_URL}/api/mocktests`;

export const mockTestApi = createApi({
  reducerPath: "mockTestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: MOCK_TEST_API,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["MockTests"],
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
      // ✅ Use a leading slash to ensure it appends correctly to the baseUrl
      query: (courseId) => `/last/${courseId}`, 
      providesTags: (result, error, courseId) => [{ type: "MockTests", id: courseId }],
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