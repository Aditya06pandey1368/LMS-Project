import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { authApi } from "@/Features/api/authApi";
import { courseApi } from "@/Features/api/courseApi";
import { purchaseApi } from "@/Features/api/purchaseApi";

export const appStore = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware , courseApi.middleware,purchaseApi.middleware),  // Moved outside `reducer`
});

const initializeApp = async () => {
    await appStore.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}))
}
initializeApp();