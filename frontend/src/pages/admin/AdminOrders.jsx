import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Package, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/utils/currency";
import axiosInstance from "@/api/axiosInstance";
import { PageHeader } from "@/components/layout/PageHeader";

export function AdminOrders() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, type: null });
    const [isProcessing, setIsProcessing] = useState(false);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus !== "all") {
                params.status = filterStatus;
            }
            const response = await axiosInstance.get("/order", { params });
            setOrders(response.data.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error(error.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.orderId || !confirmModal.type) return;

        setIsProcessing(true);
        try {
            // Confirm order (now creates payment automatically)
            if (confirmModal.type === "confirm") {
                await axiosInstance.patch(`/order/${confirmModal.orderId}/confirm`);

                toast.success("Order confirmed and payment initiated!");
            }

            // Ship order
            else if (confirmModal.type === "ship") {
                await axiosInstance.patch(`/order/${confirmModal.orderId}/shipping-status`, {
                    shippingStatus: "shipped",
                });

                toast.success("Order marked as shipped!");
            }

            setConfirmModal({ isOpen: false, orderId: null, type: null });
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to process request");
        } finally {
            setIsProcessing(false);
        }
    };


    const handleCancelSubmit = async () => {
        if (!cancelReason.trim()) {
            toast.error("Please provide a cancellation reason");
            return;
        }

        setIsProcessing(true);
        try {
            await axiosInstance.patch(`/order/${cancelModal.orderId}/cancel`, {
                reason: cancelReason,
            });
            toast.success("Order cancelled successfully!");
            setCancelModal({ isOpen: false, orderId: null });
            setCancelReason("");
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel order");
        } finally {
            setIsProcessing(false);
        }
    };

    const openConfirmModal = (orderId, type) => {
        setConfirmModal({ isOpen: true, orderId, type });
    };

    const openCancelModal = (orderId) => {
        setCancelModal({ isOpen: true, orderId });
        setCancelReason("");
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.storeId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    console.log("filteredOrders", filteredOrders);

    return (
        <MainLayout
            header={
                <PageHeader
                    title="Order Management"
                    subtitle="Manage all store orders"
                    icon={Package}
                />
            }
        >
            <div className="space-y-6">
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
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
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
                    <div className="space-y-3 md:space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer transform hover:-translate-y-0.5"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                                    {/* Order Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 md:mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                                                    Order #{order.id.slice(-8).toUpperCase()}
                                                </h3>
                                                <p className="text-xs md:text-sm text-gray-600 mt-1">
                                                    Store: {order.storeId?.name || "Unknown"}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-xl md:text-2xl font-bold text-blue-600">
                                                    {formatCurrency(order.totalAmount)}
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
                                        <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                                            <p className="text-xs md:text-sm font-medium text-gray-700 mb-2">Items:</p>
                                            <ul className="space-y-1">
                                                {order.products.map((item, index) => (
                                                    <li key={index} className="text-xs md:text-sm text-gray-900">
                                                        {item.qty}x {item.productId?.name || "Product"} - ₹
                                                        {(item.price * item.qty).toFixed(2)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Shipping Address */}
                                        {order.shippingAddress && (
                                            <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Delivery Address:
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-900">
                                                    {order.shippingAddress.fullName} - {order.shippingAddress.phone}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-600">
                                                    {order.shippingAddress.addressLine1}
                                                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-600">
                                                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                                    {order.shippingAddress.zipCode}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2 md:space-y-3">
                                        <h4 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Actions</h4>

                                        {/* Confirm Order */}
                                        {order.status === "pending" && (
                                            <Button
                                                variant="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openConfirmModal(order.id, "confirm");
                                                }}
                                                className="w-full cursor-pointer"
                                            >
                                                Confirm Order
                                            </Button>
                                        )}

                                        {/* Cancel Order */}
                                        {order.status !== "cancelled" && order.status !== "completed" && (
                                            <Button
                                                variant="secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openCancelModal(order.id);
                                                }}
                                                className="w-full cursor-pointer"
                                            >
                                                Cancel Order
                                            </Button>
                                        )}

                                        {/* Mark as Shipped */}
                                        {order.paymentStatus === "verified" &&
                                            order.shippingStatus !== "shipped" &&
                                            order.shippingStatus !== "delivered" && (
                                                <Button
                                                    variant="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openConfirmModal(order.id, "ship");
                                                    }}
                                                    className="w-full cursor-pointer"
                                                >
                                                    Mark as Shipped
                                                </Button>
                                            )}

                                        {/* View Payment */}
                                        {order.paymentId && (
                                            <Button
                                                variant="secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/payments/${order.paymentId}`);
                                                }}
                                                className="w-full cursor-pointer"
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

                {/* Confirmation Modal */}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={handleConfirmAction}
                    title={confirmModal.type === "confirm" ? "Confirm Order" : "Mark as Shipped"}
                    message={
                        confirmModal.type === "confirm"
                            ? "Are you sure you want to confirm this order? This will create a payment record and notify the store to proceed with payment."
                            : "Are you sure you want to mark this order as shipped? The store will be notified and can confirm delivery once received."
                    }
                    confirmText={confirmModal.type === "confirm" ? "Yes, Confirm Order" : "Yes, Mark as Shipped"}
                    cancelText="Cancel"
                    variant="primary"
                    isLoading={isProcessing}
                />

                {/* Cancellation Modal */}
                <Modal
                    isOpen={cancelModal.isOpen}
                    onClose={() => setCancelModal({ ...cancelModal, isOpen: false })}
                    title="Cancel Order"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Are you sure you want to cancel this order? Please provide a reason for the cancellation.
                        </p>
                        <Input
                            label="Cancellation Reason"
                            placeholder="e.g., Out of stock, Customer request"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                variant="secondary"
                                onClick={() => setCancelModal({ ...cancelModal, isOpen: false })}
                                disabled={isProcessing}
                                className="cursor-pointer"
                            >
                                Back
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleCancelSubmit}
                                isLoading={isProcessing}
                                disabled={isProcessing}
                                className="cursor-pointer"
                            >
                                Cancel Order
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </MainLayout>
    );
}
