"use client"

import { useEffect, useState } from "react"
import { BarChart3, Building2, Store, Package, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import { StatCard } from "@/components/dashboard/StatCard"
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
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get("/stats/admin/stats")
     
      const incomingStats = response.data.data || response.data 
      
      if (incomingStats && typeof incomingStats.totalCompanies === 'number') {
        setStats({
          ...incomingStats,
          revenue: incomingStats.revenue || 0,
          recentOrders: incomingStats.recentOrders || [],
        })
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err)
      
      const errorMessage = err.response?.data?.message || err.message || "An unexpected network or server error occurred."
      setError(errorMessage)
      toast.error(`Failed to load dashboard stats: ${errorMessage}`)
      
      setStats(initialStats) 
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])
  
  // Custom Loading Component
  const LoadingState = () => (
    <div className="text-center py-12 flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      <p className="text-gray-500 mt-3 font-medium">Loading dashboard data...</p>
    </div>
  )
  
  // Custom Error Component
  const ErrorState = () => (
    <div className="text-center py-12 bg-red-50 border border-red-300 rounded-lg shadow-md">
      <AlertTriangle className="h-10 w-10 mx-auto text-red-500" />
      <h2 className="text-xl font-semibold text-red-700 mt-4">Error Loading Dashboard</h2>
      <p className="text-red-600 mt-2">{error}</p>
      <button 
        onClick={fetchStats}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150"
      >
        Try Again
      </button>
    </div>
  )

  // Helper function for currency formatting
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return `$0.00`;
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard 📊</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Companies"
                value={stats.totalCompanies}
                icon={<Building2 size={24} />}
                color="blue"
              />
              <StatCard title="Total Stores" value={stats.totalStores} icon={<Store size={24} />} color="green" />
              <StatCard
                title="Total Products"
                value={stats.totalProducts}
                icon={<Package size={24} />}
                color="purple"
              />
              <StatCard title="Total Orders" value={stats.totalOrders} icon={<BarChart3 size={24} />} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Total Revenue Card - Using 'revenue' field */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-green-600" size={20} />
                  <h3 className="font-semibold text-gray-900">Total Revenue</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.revenue)}
                </p>
              </div>

              {/* Recent Orders List */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Orders 🛍️</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">Order **#{order._id.slice(-6)}**</p>
                          <p className="text-xs text-gray-500">
                            {/* Display date if available */}
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date N/A'}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-gray-500 text-sm">No recent orders to display.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}