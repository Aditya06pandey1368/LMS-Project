import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import { userLoggedIn } from "../authSlice";

// ✅ CHANGE: Use Render Backend URL
const USER_API = "https://lms-project-1-38j4.onrender.com/api/user/";

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:USER_API,
        credentials:"include"
    }),
    endpoints: (builder) =>({
        // ... (Keep existing endpoints: registerUser, loginUser, logoutUser, loadUser, updateUser exactly as they are) ...
        registerUser : builder.mutation({
            query: (inputData) =>({
                url : "register",
                method: "POST",
                body : inputData
            })
        }),
        loginUser : builder.mutation({
            query: (inputData) =>({
                url : "login",
                method: "POST",
                body : inputData
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}){
                try {
                    const result = await queryFulfilled;
                    // ✅ CRITICAL: Ensure token is passed in payload if your backend sends it
                    dispatch(userLoggedIn({
                        user: result.data.user, 
                        token: result.data.token // Ensure this matches backend response
                    }));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        logoutUser : builder.mutation({
            query: () =>({
                url:"logout",
                method:"GET"
            })
        }),
        loadUser: builder.query({
            query: () =>({
                url : "profile",
                method : "GET"
            }),
            async onQueryStarted(arg, {queryFulfilled, dispatch}){
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        updateUser: builder.mutation({
            query:(formData) =>({
                url : "profile/update",
                method:"PUT",
                body:formData,
                credentials:"include"
            })
        })
    })
})

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation
} = authApi;