"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, Building2, Store, Package, TrendingUp, AlertTriangle, Loader2, ArrowRight, ShoppingCart } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import { StatCard } from "@/components/dashboard/StatCard"
import { OrderStatusBadge } from "@/components/OrderStatusBadge"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setDashboardStats } from "@/redux/slices/adminSlice"
import axiosInstance from "@/api/axiosInstance"
import toast from "react-hot-toast"


const initialStats = {
  totalCompanies: 0,
  totalStores: 0,
  totalProducts: 0,
  totalOrders: 0,
  revenue: 0,
  recentOrders: [],
}

export const AdminDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { dashboardStats } = useAppSelector((state) => state.admin)
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get("/stats/admin/stats")
      const incomingStats = response.data.data || response.data

      if (incomingStats) {
        const statsData = {
          ...initialStats,
          ...incomingStats,
          revenue: incomingStats.revenue || 0,
          recentOrders: incomingStats.recentOrders || [],
        }
        setStats(statsData)
        dispatch(setDashboardStats(statsData))
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err)

      const errorMessage = err.response?.data?.message || err.message || "An unexpected network or server error occurred."
      setError(errorMessage)
      toast.error(`Failed to load dashboard stats: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if stats are already in Redux
    if (dashboardStats) {
      setStats(dashboardStats)
      setLoading(false)
    } else {
      fetchStats()
    }
  }, [])

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders?search=${orderId}`)
  }

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return `₹0`;
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading dashboard overview...</p>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <button
            onClick={fetchStats}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your platform's performance and recent activity.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="text-blue-600" size={24} />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Companies</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalCompanies}</h3>
            <p className="text-gray-500 text-sm mt-1">Registered Companies</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Store className="text-green-600" size={24} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Stores</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalStores}</h3>
            <p className="text-gray-500 text-sm mt-1">Active Stores</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Package className="text-purple-600" size={24} />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Products</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalProducts}</h3>
            <p className="text-gray-500 text-sm mt-1">Total Products</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <ShoppingCart className="text-orange-600" size={24} />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Orders</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalOrders}</h3>
            <p className="text-gray-500 text-sm mt-1">Total Orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-blue-100">Total Revenue</h3>
                <p className="text-sm text-blue-200">Lifetime earnings</p>
              </div>
            </div>
            <p className="text-4xl font-bold mb-2">{formatCurrency(stats.revenue)}</p>
            <div className="flex items-center gap-2 text-blue-100 text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
              <TrendingUp size={14} />
              <span>Revenue Overview</span>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={20} className="text-blue-600" />
                Recent Orders
              </h3>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight size={16} />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => handleOrderClick(order._id)}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium">
                          {order.shippingAddress?.fullName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {order.shippingAddress?.fullName || "Unknown Customer"}
                            </p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-sm text-gray-500">#{order._id.slice(-6).toUpperCase()}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-600">
                              {order.storeId?.name || "Unknown Store"}
                            </p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-xs text-gray-500">{order.products?.length || 0} items</p>
                        </div>
                        <OrderStatusBadge status={order.status} type="order" />
                        <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-900 font-medium">No recent orders</p>
                  <p className="text-gray-500 text-sm mt-1">New orders will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}