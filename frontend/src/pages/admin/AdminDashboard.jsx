"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, Building2, Store, Package, TrendingUp, AlertTriangle, Loader2, ArrowRight, ShoppingCart } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import { PageHeader } from "@/components/layout/PageHeader"
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
    <MainLayout
      header={
        <PageHeader
          title="Admin Dashboard"
          subtitle="Overview of your platform's performance and recent activity"
          icon={BarChart3}
        />
      }
    >
      <div className="space-y-8">

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Companies */}
          <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="text-blue-600" size={22} />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Companies
              </span>
            </div>
            <h3 className="text-3xl font-bold">{stats.totalCompanies}</h3>
            <p className="text-gray-500 text-sm mt-1">Registered Companies</p>
          </div>

          {/* Stores */}
          <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <Store className="text-green-600" size={22} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Stores
              </span>
            </div>
            <h3 className="text-3xl font-bold">{stats.totalStores}</h3>
            <p className="text-gray-500 text-sm mt-1">Active Stores</p>
          </div>

          {/* Products */}
          <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Package className="text-purple-600" size={22} />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Products
              </span>
            </div>
            <h3 className="text-3xl font-bold">{stats.totalProducts}</h3>
            <p className="text-gray-500 text-sm mt-1">Total Products</p>
          </div>

          {/* Orders */}
          <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <ShoppingCart className="text-orange-600" size={22} />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                Orders
              </span>
            </div>
            <h3 className="text-3xl font-bold">{stats.totalOrders}</h3>
            <p className="text-gray-500 text-sm mt-1">Total Orders</p>
          </div>
        </div>

        {/* Revenue + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue */}
          <div className="col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-lg">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-blue-100">Total Revenue</h3>
                  <p className="text-sm text-blue-200">Lifetime earnings</p>
                </div>
              </div>

              <p className="text-4xl font-bold mb-2">
                {formatCurrency(stats.revenue)}
              </p>

              <div className="flex items-center gap-2 bg-white/10 text-sm px-3 py-1 rounded-full w-fit">
                <TrendingUp size={14} />
                <span>Revenue Overview</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-gray-900">
                <ShoppingCart className="text-blue-600" size={18} />
                Recent Orders
              </h3>

              <button
                onClick={() => navigate("/admin/orders")}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="divide-y">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.slice(0, 6).map(order => (
                  <div
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className="p-4 hover:bg-gray-50 cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

                      {/* Left */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                          {order.storeId?.name?.charAt(0).toUpperCase() || "?"}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {order.storeId?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {order.shippingAddress?.fullName} •{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-xs text-gray-500">{order.products?.length} items</p>
                        </div>

                        <OrderStatusBadge status={order.status} type="order" />

                        <ArrowRight
                          size={18}
                          className="text-gray-300 group-hover:text-blue-600"
                        />
                      </div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-gray-500">
                  No recent orders
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}