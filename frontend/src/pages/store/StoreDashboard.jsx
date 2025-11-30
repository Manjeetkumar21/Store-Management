import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingBag, TrendingUp, Package, Clock, Loader2, AlertTriangle, ArrowRight } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import { StatCard } from "@/components/dashboard/StatCard"
import { formatCurrency } from "@/utils/currency"
import axiosInstance from "@/api/axiosInstance"
import toast from "react-hot-toast"
import { useAppSelector } from "@/redux/hooks"

// Defines the internal structure of the component's state
const initialStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
}

export const StoreDashboard = () => {
    const navigate = useNavigate()
    // Assuming 'user' is part of the auth slice and contains the store's ID
    const { user } = useAppSelector((state) => state.auth)
    const [stats, setStats] = useState(initialStats)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchStats = async (userId) => {
        if (!userId) return // Guard clause if user ID is not available yet

        setLoading(true)
        setError(null)
        try {
            // API call using the user ID
            const response = await axiosInstance.get(`/stats/store/${userId}/stats`)
            const data = response.data.data

            if (data) {
                // MAPPING FIX: Map API response fields to component state fields
                setStats({
                    totalProducts: data.storeProducts || 0,
                    totalOrders: data.storeOrders || 0,
                    totalRevenue: data.totalSales || 0, // Mapped from totalSales
                    recentOrders: data.recentOrders || [],
                })
                toast.success("Store dashboard loaded successfully!")
            } else {
                throw new Error("Data structure from server is invalid.")
            }
        } catch (err) {
            console.error("Failed to load dashboard stats:", err)
            const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred."
            setError(errorMessage)
            toast.error(`Failed to load dashboard stats: ${errorMessage}`)
            setStats(initialStats)
        } finally {
            setLoading(false)
        }
    }

    // Dependency FIX: Run useEffect when the user object (and thus user._id) becomes available
    useEffect(() => {
        if (user?._id) {
            fetchStats(user._id)
        }
    }, [user?._id])

    const LoadingState = () => (
        <div className="text-center py-12 flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-gray-500 mt-3 font-medium">Loading store dashboard data...</p>
        </div>
    )

    const ErrorState = () => (
        <div className="text-center py-12 bg-red-50 border border-red-300 rounded-lg shadow-md">
            <AlertTriangle className="h-10 w-10 mx-auto text-red-500" />
            <h2 className="text-xl font-semibold text-red-700 mt-4">Error Loading Dashboard</h2>
            <p className="text-red-600 mt-2">{error}</p>
            <button
                onClick={() => fetchStats(user?._id)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150"
            >
                Try Again
            </button>
        </div>
    )


    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Store Dashboard 🛍️</h1>
                    <p className="text-gray-600 mt-2">Welcome back to your store, **{user?.name || 'Store Owner'}**!</p>
                </div>

                {loading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Uses totalProducts, mapped from storeProducts */}
                            <StatCard
                                title="Total Products"
                                value={stats.totalProducts}
                                icon={<Package size={24} />}
                                color="blue"
                            />
                            {/* Uses totalOrders, mapped from storeOrders */}
                            <StatCard
                                title="Total Orders"
                                value={stats.totalOrders}
                                icon={<ShoppingBag size={24} />}
                                color="green"
                            />
                            {/* Uses totalRevenue, mapped from totalSales, formatted as currency */}
                            <StatCard
                                title="Total Revenue"
                                value={formatCurrency(stats.totalRevenue)}
                                icon={<TrendingUp size={24} />}
                                color="purple"
                            />
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="text-indigo-600" size={20} />
                                    <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                                </div>
                                <button
                                    onClick={() => navigate("/store/orders")}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    View All
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {stats.recentOrders.length > 0 ? (
                                    stats.recentOrders.map((order) => (
                                        <div
                                            key={order._id}
                                            onClick={() => navigate(`/store/orders/${order._id}`)}
                                            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 group-hover:text-blue-600">Order **#{order._id.slice(-6)}**</p>
                                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right flex items-center gap-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                                                    {/* Fallback for order status display */}
                                                    <p className="text-xs text-blue-600">{order.status || 'Processing'}</p>
                                                </div>
                                                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center">
                                        <p className="text-gray-500 text-sm">No recent orders to display.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    )
}