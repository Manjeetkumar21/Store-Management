import { useEffect, useState } from "react";
import { Package, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import axiosInstance from "@/api/axiosInstance";

export const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [cancellingOrderId, setCancellingOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const fetchOrders = async () => {
        try {
            const params = {};
            if (filterStatus !== "all") {
                params.status = filterStatus;
            }
            const response = await axiosInstance.get("/order", { params });
            setOrders(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async (orderId) => {
        if (!confirm("Confirm this order?")) return;

        try {
            await axiosInstance.patch(`/order/${orderId}/confirm`);
            toast.success("Order confirmed successfully!");
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to confirm order");
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!cancelReason.trim()) {
            toast.error("Please provide a cancellation reason");
            return;
        }

        try {
            await axiosInstance.patch(`/order/${orderId}/cancel`, {
                reason: cancelReason,
            });
            toast.success("Order cancelled successfully!");
            setCancellingOrderId(null);
            setCancelReason("");
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel order");
        }
    };

    const handleMarkAsShipped = async (orderId) => {
        if (!confirm("Mark this order as shipped?")) return;

        try {
            await axiosInstance.patch(`/order/${orderId}/ship`);
            toast.success("Order marked as shipped!");
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to mark as shipped");
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.storeId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Package size={32} />
                        Order Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage all store orders</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by order ID or store name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={20} className="text-gray-600" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Package size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Order Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    Order #{order._id.slice(-8).toUpperCase()}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Store: {order.storeId?.name || "Unknown"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    ₹{order.totalAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <OrderStatusBadge status={order.status} type="order" />
                                            <OrderStatusBadge status={order.paymentStatus} type="payment" />
                                            <OrderStatusBadge status={order.shippingStatus} type="shipping" />
                                        </div>

                                        {/* Products */}
                                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                                            <ul className="space-y-1">
                                                {order.products.map((item, index) => (
                                                    <li key={index} className="text-sm text-gray-900">
                                                        {item.qty}x {item.productId?.name || "Product"} - ₹
                                                        {(item.price * item.qty).toFixed(2)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Shipping Address */}
                                        {order.shippingAddress && (
                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    Delivery Address:
                                                </p>
                                                <p className="text-sm text-gray-900">
                                                    {order.shippingAddress.fullName} - {order.shippingAddress.phone}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {order.shippingAddress.addressLine1}
                                                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                                    {order.shippingAddress.zipCode}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>

                                        {/* Confirm Order */}
                                        {order.status === "pending" && (
                                            <Button
                                                variant="primary"
                                                onClick={() => handleConfirmOrder(order._id)}
                                                className="w-full"
                                            >
                                                Confirm Order
                                            </Button>
                                        )}

                                        {/* Cancel Order */}
                                        {order.status !== "cancelled" && order.status !== "completed" && (
                                            <>
                                                {cancellingOrderId === order._id ? (
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Cancellation reason"
                                                            value={cancelReason}
                                                            onChange={(e) => setCancelReason(e.target.value)}
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="primary"
                                                                onClick={() => handleCancelOrder(order._id)}
                                                                className="flex-1"
                                                                size="sm"
                                                            >
                                                                Confirm
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                onClick={() => {
                                                                    setCancellingOrderId(null);
                                                                    setCancelReason("");
                                                                }}
                                                                className="flex-1"
                                                                size="sm"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => setCancellingOrderId(order._id)}
                                                        className="w-full"
                                                    >
                                                        Cancel Order
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                        {/* Mark as Shipped */}
                                        {order.paymentStatus === "verified" &&
                                            order.shippingStatus !== "shipped" &&
                                            order.shippingStatus !== "delivered" && (
                                                <Button
                                                    variant="primary"
                                                    onClick={() => handleMarkAsShipped(order._id)}
                                                    className="w-full"
                                                >
                                                    Mark as Shipped
                                                </Button>
                                            )}

                                        {/* View Payment */}
                                        {order.paymentId && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => window.location.href = `/admin/payments`}
                                                className="w-full"
                                            >
                                                View Payment
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Cancellation Info */}
                                {order.status === "cancelled" && order.cancellationReason && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm font-medium text-red-900">Cancellation Reason:</p>
                                        <p className="text-sm text-red-700 mt-1">{order.cancellationReason}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};
