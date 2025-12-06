import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Package, MapPin, CreditCard, User, Store, Calendar, Eye } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { OrderStatusBadge } from "@/components/OrderStatusBadge"
import { OrderTimeline } from "@/components/OrderTimeline"
import { formatCurrency } from "@/utils/currency"
import axiosInstance from "@/api/axiosInstance"

export const AdminOrderDetails = () => {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrderDetails()
    }, [orderId])

    const fetchOrderDetails = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/order/${orderId}`)
            setOrder(response.data.data)
        } catch (error) {
            toast.error("Failed to fetch order details")
            navigate("/admin/orders")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading order details...</p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    if (!order) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-64">
                    <Package size={64} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4 text-lg">Order not found</p>
                    <Button onClick={() => navigate("/admin/orders")}>
                        Back to Orders
                    </Button>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="space-y-4 md:space-y-6 pb-8">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate("/admin/orders")}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors self-start"
                        >
                            <ArrowLeft size={20} className="text-gray-700 sm:w-6 sm:h-6" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg self-start">
                                    <Package size={20} className="text-blue-600 sm:w-7 sm:h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">Order #{order.id.slice(-8).toUpperCase()}</h1>
                                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')} at {new Date(order.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <div className="sm:hidden mt-3">
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(order.totalAmount)}</p>
                            </div>
                        </div>
                        <div className="hidden sm:block text-right">
                            <p className="text-2xl md:text-3xl font-bold text-blue-600">{formatCurrency(order.totalAmount)}</p>
                        </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
                        <OrderStatusBadge status={order.status} type="order" />
                        <OrderStatusBadge status={order.paymentStatus} type="payment" />
                        <OrderStatusBadge status={order.shippingStatus} type="shipping" />
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Order Timeline</h2>
                    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                        <OrderTimeline order={order} />
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Products */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package size={20} className="md:w-6 md:h-6" />
                                Order Items
                            </h2>
                            <div className="space-y-3 md:space-y-4">
                                {order.products.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                            <Package size={20} className="text-gray-400 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                                                {item.productId?.name || "Product"}
                                            </h3>
                                            <p className="text-xs md:text-sm text-gray-600">Quantity: {item.qty}</p>
                                            <p className="text-xs md:text-sm text-gray-600">Price: {formatCurrency(item.price)}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="font-bold text-gray-900 text-sm md:text-base">
                                                {formatCurrency(item.price * item.qty)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="md:w-6 md:h-6" />
                                    Delivery Address
                                </h2>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                                    <p className="font-semibold text-gray-900 text-sm md:text-base">
                                        {order.shippingAddress.fullName}
                                    </p>
                                    <p className="text-gray-700 text-sm md:text-base">{order.shippingAddress.phone}</p>
                                    <p className="text-gray-700 mt-2 text-sm md:text-base">
                                        {order.shippingAddress.addressLine1}
                                    </p>
                                    {order.shippingAddress.addressLine2 && (
                                        <p className="text-gray-700 text-sm md:text-base">{order.shippingAddress.addressLine2}</p>
                                    )}
                                    <p className="text-gray-700 text-sm md:text-base">
                                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                        {order.shippingAddress.zipCode}
                                    </p>
                                    <p className="text-gray-700 text-sm md:text-base">{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Summary & Actions */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Store Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                                <Store size={18} className="md:w-5 md:h-5" />
                                Store Details
                            </h3>
                            <div className="space-y-2 text-xs md:text-sm">
                                <div>
                                    <p className="text-gray-600">Store Name</p>
                                    <p className="font-medium text-gray-900">{order.storeId?.name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Location</p>
                                    <p className="font-medium text-gray-900">{order.storeId?.location || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Order Summary</h3>
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm md:text-base">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base md:text-lg pt-2 md:pt-3 border-t border-gray-200">
                                    <span>Total</span>
                                    <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {order.paymentId && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Quick Actions</h3>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate(`/admin/payments/${order.paymentId.id || order.paymentId}`)}
                                    className="w-full flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    <Eye size={14} className="md:w-4 md:h-4" />
                                    View Payment Details
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
