import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  companies: [],
  stores: [],
  products: [],
  selectedCompany: null,
  selectedStore: null,
  loading: false,
  error: null,
}

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setCompanies: (state, action) => {
      state.companies = action.payload
    },
    addCompany: (state, action) => {
      state.companies.push(action.payload)
    },
    setStores: (state, action) => {
      state.stores = action.payload
    },
    addStore: (state, action) => {
      state.stores.push(action.payload)
    },
    updateStore: (state, action) => {
      const index = state.stores.findIndex((s) => s._id === action.payload._id)
      if (index !== -1) state.stores[index] = action.payload
    },
    deleteStore: (state, action) => {
      state.stores = state.stores.filter((s) => s._id !== action.payload)
    },
    setProducts: (state, action) => {
      state.products = action.payload
    },
    addProduct: (state, action) => {
      state.products.push(action.payload)
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex((p) => p._id === action.payload._id)
      if (index !== -1) state.products[index] = action.payload
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter((p) => p._id !== action.payload)
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoading,
  setCompanies,
  addCompany,
  setStores,
  addStore,
  updateStore,
  deleteStore,
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setError,
  clearError,
} = adminSlice.actions

export default adminSlice.reducer
