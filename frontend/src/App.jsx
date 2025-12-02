import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { RootRedirect } from "./components/RootRedirect"
import { Login } from "./pages/Login"

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { AdminLanding } from "./pages/admin/AdminLanding"
import { Companies } from "./pages/admin/Companies"
import { Stores } from "./pages/admin/Stores"
import { StoreDetails } from "./pages/admin/StoreDetails"
import { Products } from "./pages/admin/Products"
import { AdminOrders } from "./pages/admin/AdminOrders"
import { AdminOrderDetails } from "./pages/admin/AdminOrderDetails"
import { AdminPayments } from "./pages/admin/AdminPayments"
import { AdminPaymentDetails } from "./pages/admin/AdminPaymentDetails"

// Store Pages
import { StoreDashboard } from "./pages/store/StoreDashboard"
import { StoreLanding } from "./pages/store/StoreLanding"
import { StoreProducts } from "./pages/store/Products"
import { Cart } from "./pages/store/Cart"
import { Checkout } from "./pages/store/Checkout"
import { Orders } from "./pages/store/Orders"
import { OrderDetails } from "./pages/store/OrderDetails"
import { AddressManagement } from "./pages/store/AddressManagement"
import { PaymentQR } from "./pages/store/PaymentQR"

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Landing Pages - Public */}
        <Route path="/admin" element={<AdminLanding />} />
        <Route path="/store" element={<StoreLanding />} />

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
          path="/admin/stores/:storeId"
          element={
            <ProtectedRoute requiredRole="admin">
              <StoreDetails />
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
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders/:orderId"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminOrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments/:paymentId"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPaymentDetails />
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
        <Route
          path="/store/orders/:orderId"
          element={
            <ProtectedRoute requiredRole="store">
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/addresses"
          element={
            <ProtectedRoute requiredRole="store">
              <AddressManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/payment/:orderId"
          element={
            <ProtectedRoute requiredRole="store">
              <PaymentQR />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}


export default App
