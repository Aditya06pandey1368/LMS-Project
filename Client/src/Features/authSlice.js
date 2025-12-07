import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
    token: null // ✅ CHANGE: Add token state
}

const authSlice = createSlice({
    name: "authSlice",
    initialState,
    reducers: {
        userLoggedIn: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.token = action.payload.token; // ✅ CHANGE: Save the token
        },
        userLoggedOut: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.token = null; // ✅ CHANGE: Clear the token
        }
    }
})

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;