import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  items: JSON.parse(localStorage.getItem("cart") || "[]"),
  showBadge: false,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload
      localStorage.setItem("cart", JSON.stringify(action.payload))
      state.showBadge = true
    },
    addToCart: (state, action) => {
      const existing = state.items.find((item) => item.productId === action.payload.productId)
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
      localStorage.setItem("cart", JSON.stringify(state.items))
      state.showBadge = true
    },
    updateCartItem: (state, action) => {
      const item = state.items.find((i) => i.productId === action.payload.productId)
      if (item) {
        item.quantity = action.payload.quantity
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.productId !== action.payload.productId)
        }
      }
      localStorage.setItem("cart", JSON.stringify(state.items))
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.productId !== action.payload)
      localStorage.setItem("cart", JSON.stringify(state.items))
    },
    clearCart: (state) => {
      state.items = []
      localStorage.setItem("cart", JSON.stringify(state.items))
    },
    hideBadge: (state) => {
      state.showBadge = false
    },
  },
})

export const { addToCart, setCart, updateCartItem, removeFromCart, clearCart, hideBadge } = cartSlice.actions
export default cartSlice.reducer
