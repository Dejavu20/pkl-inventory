import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const initialState = {
    user: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ""
}

export const LoginUser = createAsyncThunk("user/LoginUser", async(user, thunkAPI) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, {
            email: user.email,
            password: user.password
        }, {
            withCredentials: true // Important for session cookies
        });
        return response.data;
    } catch (error) {
        if(error.response){
            const message = error.response.data.msg || error.response.data.message || "Login gagal";
            return thunkAPI.rejectWithValue(message);
        }
        return thunkAPI.rejectWithValue("Login failed - Tidak dapat terhubung ke server");
    }
});

export const getMe = createAsyncThunk("user/getMe", async(_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
            withCredentials: true // Important for session cookies
        });
        return response.data;
    } catch (error) {
        if(error.response){
            const message = error.response.data.msg || error.response.data.message || "Gagal mendapatkan data user";
            return thunkAPI.rejectWithValue(message);
        }
        return thunkAPI.rejectWithValue("Failed to get user data");
    }
});

export const LogOut = createAsyncThunk("user/LogOut", async() => {
    await axios.delete(`${API_BASE_URL}/logout`, {
        withCredentials: true // Important for session cookies
    });
});

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        reset: (state) => initialState
    },
    extraReducers:(builder) =>{
        builder.addCase(LoginUser.pending, (state) =>{
            state.isLoading = true;
        });
        builder.addCase(LoginUser.fulfilled, (state, action) =>{
            state.isLoading = false;
            state.isSuccess = true;
            state.user = action.payload;
        });
        builder.addCase(LoginUser.rejected, (state, action) =>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })

        // Get User Login
        builder.addCase(getMe.pending, (state) =>{
            state.isLoading = true;
        });
        builder.addCase(getMe.fulfilled, (state, action) =>{
            state.isLoading = false;
            state.isSuccess = true;
            state.user = action.payload;
        });
        builder.addCase(getMe.rejected, (state, action) =>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
    }
});

export const {reset} = authSlice.actions;
export default authSlice.reducer;