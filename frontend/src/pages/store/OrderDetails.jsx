import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, CheckCircle2, Package, MapPin, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { OrderTimeline } from "@/components/OrderTimeline";
import { ConfirmModal } from "@/components/ui/Modal";
import axiosInstance from "@/api/axiosInstance";
import { formatCurrency } from "@/utils/currency";

export const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axiosInstance.get(`/order/${orderId}`);
            setOrder(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch order details");
            navigate("/store/orders");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReceived = async () => {
        setIsConfirming(true);
        try {
            await axiosInstance.patch(`/order/${orderId}/received`);
            toast.success("Order marked as received!");
            setShowConfirmModal(false);
            fetchOrderDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to confirm order");
        } finally {
            setIsConfirming(false);
        }
    };

    const handleDownloadReceipt = async () => {
        if (!order.paymentId) {
            toast.error("No payment information available");
            return;
        }

        try {
            const paymentId = order.paymentId.id || order.paymentId;
            const response = await axiosInstance.get(`/payment/${paymentId}/receipt`);
            const receiptData = response.data.data;

            const receiptWindow = window.open("", "_blank");
            receiptWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt - ${receiptData.receiptNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .row { display: flex; justify-between: space-between; margin: 10px 0; }
              .label { font-weight: bold; }
              .amount { font-size: 24px; color: #2563eb; font-weight: bold; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Payment Receipt</h1>
              <p>Receipt Number: ${receiptData.receiptNumber}</p>
            </div>
            <div class="row">
              <span class="label">Transaction ID:</span>
              <span>${receiptData.transactionId}</span>
            </div>
            <div class="row">
              <span class="label">Payment Date:</span>
              <span>${new Date(receiptData.paymentDate).toLocaleString()}</span>
            </div>
            <div class="row">
              <span class="label">Verified Date:</span>
              <span>${new Date(receiptData.verifiedDate).toLocaleString()}</span>
            </div>
            <div class="row" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
              <span class="label">Amount Paid:</span>
              <span class="amount">₹${receiptData.amount}</span>
            </div>
            <button onclick="window.print()" style="margin-top: 30px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Receipt
            </button>
          </body>
        </html>
      `);
            receiptWindow.document.close();
        } catch (error) {
            toast.error("Failed to download receipt");
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading order details...</p>
                </div>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Order not found</p>
                    <Button variant="secondary" onClick={() => navigate("/store/orders")} className="mt-4 cursor-pointer">
                        Back to Orders
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <button
                    onClick={() => navigate("/store/orders")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    Back to Orders
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                            {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">{formatCurrency(order.totalAmount)}</p>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-3">
                    <OrderStatusBadge status={order.status} type="order" />
                    <OrderStatusBadge status={order.paymentStatus} type="payment" />
                    <OrderStatusBadge status={order.shippingStatus} type="shipping" />
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Order Timeline</h2>
                    <OrderTimeline order={order} />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Products */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package size={24} />
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {order.products.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                            <Package size={24} className="text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {item.productId?.name || "Product"}
                                            </h3>
                                            <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                                            <p className="text-sm text-gray-600">Price: {formatCurrency(item.price)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">
                                                {formatCurrency(item.price * item.qty)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin size={24} />
                                    Delivery Address
                                </h2>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="font-semibold text-gray-900">
                                        {order.shippingAddress.fullName}
                                    </p>
                                    <p className="text-gray-700">{order.shippingAddress.phone}</p>
                                    <p className="text-gray-700 mt-2">
                                        {order.shippingAddress.addressLine1}
                                    </p>
                                    {order.shippingAddress.addressLine2 && (
                                        <p className="text-gray-700">{order.shippingAddress.addressLine2}</p>
                                    )}
                                    <p className="text-gray-700">
                                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                        {order.shippingAddress.zipCode}
                                    </p>
                                    <p className="text-gray-700">{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Information */}
                        {order.paymentId && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard size={24} />
                                    Payment Information
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="font-medium text-gray-900">
                                            {order.paymentId.paymentMethod?.toUpperCase().replace("_", " ")}
                                        </span>
                                    </div>
                                    {order.paymentId.transactionId && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Transaction ID:</span>
                                            <span className="font-mono font-medium text-gray-900">
                                                {order.paymentId.transactionId}
                                            </span>
                                        </div>
                                    )}
                                    {order.paymentId.paidAt && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Paid At:</span>
                                            <span className="text-gray-900">
                                                {new Date(order.paymentId.paidAt).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {order.paymentId.verifiedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Verified At:</span>
                                            <span className="text-gray-900">
                                                {new Date(order.paymentId.verifiedAt).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cancellation Info */}
                        {order.status === "cancelled" && order.cancellationReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <h3 className="font-semibold text-red-900 mb-2">Order Cancelled</h3>
                                <p className="text-red-700">{order.cancellationReason}</p>
                                {order.cancelledAt && (
                                    <p className="text-sm text-red-600 mt-2">
                                        Cancelled on {new Date(order.cancelledAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Actions & Summary */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                                    <span>Total</span>
                                    <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                            <div className="space-y-3">
                                {/* Proceed to Payment */}
                                {order.status === "confirmed" && order.paymentStatus === "pending" && (
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate(`/store/payment/${order.id}`)}
                                        className="w-full flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <CreditCard size={16} />
                                        Proceed to Payment
                                    </Button>
                                )}

                                {/* Download Receipt */}
                                {order.paymentStatus === "verified" && (
                                    <Button
                                        variant="secondary"
                                        onClick={handleDownloadReceipt}
                                        className="w-full flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Download size={16} />
                                        Download Receipt
                                    </Button>
                                )}

                                {/* Confirm Received */}
                                {order.shippingStatus === "shipped" && !order.orderReceivedConfirmation && (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowConfirmModal(true)}
                                        className="w-full flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <CheckCircle2 size={16} />
                                        Confirm Received
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirm Received Modal */}
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmReceived}
                    title="Confirm Order Received"
                    message="Have you received this order in good condition? This action confirms that the order has been delivered successfully."
                    confirmText="Yes, Confirm"
                    cancelText="Not Yet"
                    variant="primary"
                    isLoading={isConfirming}
                />
            </div>
        </MainLayout>
    );
};
