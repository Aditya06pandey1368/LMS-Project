import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../Features/authSlice";
import { authApi } from "@/Features/api/authApi";
import { courseApi } from "@/Features/api/courseApi";
import { purchaseApi } from "@/Features/api/purchaseApi";
import { courseProgressApi } from "@/Features/api/courseProgressApi";
import { mockTestApi } from "@/Features/api/mockTestApi";

const rootReducer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    [courseApi.reducerPath]:courseApi.reducer,
    [purchaseApi.reducerPath]:purchaseApi.reducer,
    [courseProgressApi.reducerPath]:courseProgressApi.reducer,
    [mockTestApi.reducerPath]:mockTestApi.reducer,
    auth:authReducer
})

export default rootReducer;