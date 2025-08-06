import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../Features/authSlice";
import { authApi } from "@/Features/api/authApi";
import { courseApi } from "@/Features/api/courseApi";

const rootReducer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    [courseApi.reducerPath]:courseApi.reducer,
    auth:authReducer
})

export default rootReducer;