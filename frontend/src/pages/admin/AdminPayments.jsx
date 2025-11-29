import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, XCircle, Download } from "lucide-react";
import toast from "react-hot-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import axiosInstance from "@/api/axiosInstance";

export const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [verifyingPaymentId, setVerifyingPaymentId] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState("");

    useEffect(() => {
        fetchPayments();
    }, [filterStatus]);

    const fetchPayments = async () => {
        try {
            const params = {};
            if (filterStatus !== "all") {
                params.status = filterStatus;
            }
            const response = await axiosInstance.get("/payment", { params });
            setPayments(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch payments");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPayment = async (paymentId, verified) => {
        try {
            await axiosInstance.post(`/payment/${paymentId}/verify`, {
                verified,
                notes: verificationNotes,
            });
            toast.success(
                verified ? "Payment verified successfully!" : "Payment marked as failed"
            );
            setVerifyingPaymentId(null);
            setVerificationNotes("");
            fetchPayments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to verify payment");
        }
    };

    const handleDownloadReceipt = async (paymentId) => {
        try {
            const response = await axiosInstance.get(`/payment/${paymentId}/receipt`);
            const receiptData = response.data.data;

            // Create a simple receipt display
            const receiptWindow = window.open("", "_blank");
            receiptWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt - ${receiptData.receiptNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .row { display: flex; justify-content: space-between; margin: 10px 0; }
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
              <span class="amount">₹${receiptData.amount.toFixed(2)}</span>
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

    const filteredPayments = payments;

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard size={32} />
                        Payment Management
                    </h1>
                    <p className="text-gray-600 mt-2">Verify and manage payments</p>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Filter:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Payments</option>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="verified">Verified</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Payments List */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading payments...</p>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">No payments found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPayments.map((payment) => (
                            <div
                                key={payment._id}
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Payment Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    Payment #{payment._id.slice(-8).toUpperCase()}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Order: #{payment.orderId?._id?.slice(-8).toUpperCase() || "N/A"}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Store: {payment.orderId?.storeId?.name || "Unknown"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(payment.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    ₹{payment.amount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mb-4">
                                            <OrderStatusBadge status={payment.status} type="payment" />
                                        </div>

                                        {/* Transaction Details */}
                                        <div className="space-y-3">
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Payment Details:
                                                </p>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Method:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {payment.paymentMethod.toUpperCase().replace("_", " ")}
                                                        </span>
                                                    </div>
                                                    {payment.transactionId && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Transaction ID:</span>
                                                            <span className="font-mono font-medium text-gray-900">
                                                                {payment.transactionId}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {payment.paidAt && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Paid At:</span>
                                                            <span className="text-gray-900">
                                                                {new Date(payment.paidAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {payment.verifiedAt && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Verified At:</span>
                                                            <span className="text-gray-900">
                                                                {new Date(payment.verifiedAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {payment.notes && (
                                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <p className="text-sm font-medium text-yellow-900">Notes:</p>
                                                    <p className="text-sm text-yellow-700 mt-1">{payment.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>

                                        {/* Verify Payment */}
                                        {payment.status === "submitted" && (
                                            <>
                                                {verifyingPaymentId === payment._id ? (
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Verification notes (optional)"
                                                            value={verificationNotes}
                                                            onChange={(e) => setVerificationNotes(e.target.value)}
                                                        />
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => handleVerifyPayment(payment._id, true)}
                                                            className="w-full flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Verify Payment
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => handleVerifyPayment(payment._id, false)}
                                                            className="w-full flex items-center justify-center gap-2"
                                                        >
                                                            <XCircle size={16} />
                                                            Mark as Failed
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => {
                                                                setVerifyingPaymentId(null);
                                                                setVerificationNotes("");
                                                            }}
                                                            className="w-full"
                                                            size="sm"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => setVerifyingPaymentId(payment._id)}
                                                        className="w-full"
                                                    >
                                                        Verify Payment
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                        {/* Download Receipt */}
                                        {payment.status === "verified" && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleDownloadReceipt(payment._id)}
                                                className="w-full flex items-center justify-center gap-2"
                                            >
                                                <Download size={16} />
                                                Download Receipt
                                            </Button>
                                        )}

                                        {/* View Order */}
                                        {payment.orderId && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => window.location.href = `/admin/orders`}
                                                className="w-full"
                                            >
                                                View Order
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};
