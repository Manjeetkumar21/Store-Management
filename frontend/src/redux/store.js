import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import adminReducer from "./slices/adminSlice"
import cartReducer from "./slices/cartSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    cart: cartReducer,
  },
})