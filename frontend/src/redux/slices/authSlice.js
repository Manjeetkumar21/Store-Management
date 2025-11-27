import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.loading = false
      state.error = null
      localStorage.setItem("user", JSON.stringify(action.payload.user))
      localStorage.setItem("token", action.payload.token)
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { setLoading, loginSuccess, loginFailure, logout, clearError } = authSlice.actions
export default authSlice.reducer
