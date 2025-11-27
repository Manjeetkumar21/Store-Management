import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Login } from "./pages/Login"

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { Companies } from "./pages/admin/Companies"
import { Stores } from "./pages/admin/Stores"
import { Products } from "./pages/admin/Products"

// Store Pages
import { StoreDashboard } from "./pages/store/StoreDashboard"
import { StoreProducts } from "./pages/store/Products"
import { Cart } from "./pages/store/Cart"
import { Checkout } from "./pages/store/Checkout"
import { Orders } from "./pages/store/Orders"

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute requiredRole="admin">
              <Companies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute requiredRole="admin">
              <Stores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requiredRole="admin">
              <Products />
            </ProtectedRoute>
          }
        />

        {/* Store Routes */}
        <Route
          path="/store/dashboard"
          element={
            <ProtectedRoute requiredRole="store">
              <StoreDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/products"
          element={
            <ProtectedRoute requiredRole="store">
              <StoreProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/cart"
          element={
            <ProtectedRoute requiredRole="store">
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/checkout"
          element={
            <ProtectedRoute requiredRole="store">
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/orders"
          element={
            <ProtectedRoute requiredRole="store">
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}


export default App
