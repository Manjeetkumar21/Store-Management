import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QrCode, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axiosInstance from "@/api/axiosInstance";

export const PaymentQR = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [payment, setPayment] = useState(null);
    const [transactionId, setTransactionId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchOrderAndPayment();
    }, [orderId]);

    const fetchOrderAndPayment = async () => {
        try {
            const orderResponse = await axiosInstance.get(`/order/${orderId}`);
            setOrder(orderResponse.data.data);

            if (orderResponse.data.data.paymentId) {
                const paymentResponse = await axiosInstance.get(
                    `/payment/order/${orderId}`
                );
                setPayment(paymentResponse.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch order details");
            navigate("/store/orders");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTransaction = async (e) => {
        e.preventDefault();

        if (!transactionId.trim()) {
            toast.error("Please enter transaction ID");
            return;
        }

        setSubmitting(true);
        try {
            await axiosInstance.post(`/payment/order/${orderId}/transaction`, {
                transactionId: transactionId.trim(),
            });

            toast.success("Transaction ID submitted successfully!");
            navigate("/store/orders");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit transaction ID");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading payment details...</p>
                </div>
            </MainLayout>
        );
    }

    if (!order || !payment) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Payment information not available</p>
                    <Button
                        variant="secondary"
                        onClick={() => navigate("/store/orders")}
                        className="mt-4"
                    >
                        Back to Orders
                    </Button>
                </div>
            </MainLayout>
        );
    }

    if (payment.status === "submitted" || payment.status === "verified") {
        return (
            <MainLayout>
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {payment.status === "verified"
                                ? "Payment Verified!"
                                : "Transaction ID Submitted"}
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {payment.status === "verified"
                                ? "Your payment has been verified by admin."
                                : "Your transaction ID has been submitted. Waiting for admin verification."}
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                            <p className="font-mono font-semibold text-gray-900">
                                {payment.transactionId}
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate("/store/orders")}
                            className="w-full"
                        >
                            View Orders
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <button
                    onClick={() => navigate("/store/orders")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                    <ArrowLeft size={20} />
                    Back to Orders
                </button>

                <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Complete Payment
                        </h1>
                        <p className="text-gray-600">
                            Scan the QR code below to make payment
                        </p>
                    </div>

                    {/* QR Code Display */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-6 rounded-lg border-2 border-gray-300 shadow-lg">
                            {payment.qrCodeUrl ? (
                                <img
                                    src={payment.qrCodeUrl}
                                    alt="Payment QR Code"
                                    className="w-64 h-64 object-contain"
                                />
                            ) : (
                                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                                    <QrCode size={128} className="text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 mb-1">Order ID</p>
                                <p className="font-semibold text-gray-900">
                                    #{order._id.slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Amount to Pay</p>
                                <p className="font-bold text-2xl text-blue-600">
                                    ₹{payment.amount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction ID Form */}
                    <form onSubmit={handleSubmitTransaction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Transaction ID *
                            </label>
                            <Input
                                placeholder="Enter the transaction ID from your payment app"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                After completing the payment, enter the transaction ID here
                            </p>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={submitting}
                        >
                            Submit Transaction ID
                        </Button>
                    </form>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Please make sure to complete the payment
                            before submitting the transaction ID. Your order will be processed
                            after admin verification.
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
