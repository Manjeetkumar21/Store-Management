import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle, XCircle, Download } from "lucide-react";
import toast from "react-hot-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { formatCurrency } from "@/utils/currency";
import axiosInstance from "@/api/axiosInstance";
import { PageHeader } from "@/components/layout/PageHeader";

export const AdminPayments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [verifyingPaymentId, setVerifyingPaymentId] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState("");

    useEffect(() => {
        fetchPayments();
    }, [filterStatus]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus !== "all") {
                params.status = filterStatus;
            }
            const response = await axiosInstance.get("/payment", { params });
            setPayments(response.data.data);
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error(error.response?.data?.message || "Failed to fetch payments");
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
              body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .row { display: flex; justify-content: space-between; margin: 10px 0; }
              .label { font-weight: bold; }
              .amount { font-size: 24px; color: #2563eb; font-weight: bold; }
              .section { margin: 30px 0; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f3f4f6; font-weight: bold; }
              .text-right { text-align: right; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Payment Receipt</h1>
              <p>Receipt Number: ${receiptData.receiptNumber}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Transaction Details</div>
              <div class="row">
                <span class="label">Transaction ID:</span>
                <span>${receiptData.transactionId || 'N/A'}</span>
              </div>
              <div class="row">
                <span class="label">Order Date:</span>
                <span>${receiptData.orderDate ? new Date(receiptData.orderDate).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="row">
                <span class="label">Payment Date:</span>
                <span>${receiptData.paymentDate ? new Date(receiptData.paymentDate).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="row">
                <span class="label">Verified Date:</span>
                <span>${receiptData.verifiedDate ? new Date(receiptData.verifiedDate).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="row">
                <span class="label">Shipping Date:</span>
                <span>${receiptData.shippingDate ? new Date(receiptData.shippingDate).toLocaleString() : 'Not Shipped Yet'}</span>
              </div>
            
            </div>

            <div class="section">
              <div class="section-title">Order Items</div>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Length (cm)</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${receiptData.items?.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>${item.length}</td>
                      <td class="text-right">₹${item.price}</td>
                      <td class="text-right">₹${item.total}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="5">No items found</td></tr>'}
                </tbody>
              </table>
            </div>

            <div class="row" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
              <span class="label">Total Amount Paid:</span>
              <span class="amount">₹${receiptData.amount}</span>
            </div>
            <button onclick="window.print()" style="margin-top: 30px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Receipt
            </button>
          </body>
        </html>
      `)
      receiptWindow.document.close()
    } catch (error) {
      toast.error("Failed to download receipt")
    }
  }


    const filteredPayments = payments;

    return (
        <MainLayout
            header={
                <PageHeader
                    title="Payment Management"
                    subtitle="Verify and manage payments"
                    icon={CreditCard}
                />
            }
        >
            
            <div className="space-y-6">
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
                                key={payment.id}
                                onClick={() => navigate(`/admin/payments/${payment.id}`)}
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer transform hover:-translate-y-0.5"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Payment Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    Payment #{payment.id.slice(-8).toUpperCase()}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Order: #{payment.orderId?.id?.slice(-8).toUpperCase() || "N/A"}
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
                                                    {formatCurrency(payment.amount)}
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
                                                {verifyingPaymentId === payment.id ? (
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Verification notes (optional)"
                                                            value={verificationNotes}
                                                            onChange={(e) => setVerificationNotes(e.target.value)}
                                                        />
                                                        <Button
                                                            variant="primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleVerifyPayment(payment.id, true);
                                                            }}
                                                            className="w-full flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Verify Payment
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleVerifyPayment(payment.id, false);
                                                            }}
                                                            className="w-full flex items-center justify-center gap-2"
                                                        >
                                                            <XCircle size={16} />
                                                            Mark as Failed
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setVerifyingPaymentId(payment.id);
                                                        }}
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
                                               
                                                 onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadReceipt(payment.id);
                                                        }}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/orders/${payment.orderId}`);
                                                }}
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