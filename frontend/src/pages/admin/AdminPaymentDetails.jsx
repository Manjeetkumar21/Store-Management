import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Eye, Download } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { OrderStatusBadge } from "@/components/OrderStatusBadge"
import { formatCurrency } from "@/utils/currency"
import axiosInstance from "@/api/axiosInstance"

export const AdminPaymentDetails = () => {
    const { paymentId } = useParams()
    const navigate = useNavigate()
    const [payment, setPayment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [verificationNotes, setVerificationNotes] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        fetchPaymentDetails()
    }, [paymentId])

    const fetchPaymentDetails = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/payment/${paymentId}`)
            setPayment(response.data.data)
        } catch (error) {
            toast.error("Failed to fetch payment details")
            navigate("/admin/payments")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyPayment = async (verified) => {
        setIsProcessing(true)
        try {
            await axiosInstance.post(`/payment/${paymentId}/verify`, {
                verified,
                notes: verificationNotes,
            })
            toast.success(
                verified ? "Payment verified successfully!" : "Payment marked as failed"
            )
            setVerificationNotes("")
            fetchPaymentDetails()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to verify payment")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDownloadReceipt = async () => {
        try {
            const response = await axiosInstance.get(`/payment/${paymentId}/receipt`)
            const receiptData = response.data.data

            const receiptWindow = window.open("", "_blank")
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
              <span class="amount">₹${receiptData.amount.toLocaleString('en-IN')}</span>
            </div>
            <button onclick="window.print()" style="margin-top: 30px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Receipt
            </button>
          </body>
        </html>
      `)
        } catch (error) {
            toast.error("Failed to download receipt")
        }
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading payment details...</p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    if (!payment) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-64">
                    <CreditCard size={64} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4 text-lg">Payment not found</p>
                    <Button onClick={() => navigate("/admin/payments")}>
                        Back to Payments
                    </Button>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="space-y-6 pb-8">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate("/admin/payments")}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                        >
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <CreditCard size={28} className="text-green-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Payment #{payment._id.slice(-8).toUpperCase()}</h1>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Created on {new Date(payment.createdAt).toLocaleDateString('en-IN')} at {new Date(payment.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-4">
                        <OrderStatusBadge status={payment.status} type="payment" />
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                                            <p className="font-semibold text-gray-900">
                                                {payment.paymentMethod.toUpperCase().replace("_", " ")}
                                            </p>
                                        </div>
                                        {payment.transactionId && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                                                <p className="font-mono font-semibold text-gray-900">
                                                    {payment.transactionId}
                                                </p>
                                            </div>
                                        )}
                                        {payment.paidAt && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Paid At</p>
                                                <p className="text-gray-900">
                                                    {new Date(payment.paidAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {payment.verifiedAt && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Verified At</p>
                                                <p className="text-gray-900">
                                                    {new Date(payment.verifiedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {payment.notes && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm font-medium text-yellow-900 mb-1">Verification Notes:</p>
                                        <p className="text-sm text-yellow-700">{payment.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Related Order Information */}
                        {payment.orderId && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Related Order</h2>
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Order #{payment.orderId._id?.slice(-8).toUpperCase() || "N/A"}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Store: {payment.orderId.storeId?.name || "Unknown"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Status: {payment.orderId.status || "N/A"}
                                            </p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => navigate(`/admin/orders/${payment.orderId._id || payment.orderId}`)}
                                            className="flex items-center gap-2"
                                        >
                                            <Eye size={16} />
                                            View Order
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Verification Actions */}
                        {payment.status === "submitted" && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Verify Payment</h3>
                                <div className="space-y-4">
                                    <Input
                                        label="Verification Notes (Optional)"
                                        placeholder="Add notes about verification..."
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="primary"
                                            onClick={() => handleVerifyPayment(true)}
                                            disabled={isProcessing}
                                            isLoading={isProcessing}
                                            className="flex-1 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} />
                                            Verify
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleVerifyPayment(false)}
                                            disabled={isProcessing}
                                            className="flex-1 flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Download Receipt */}
                        {payment.status === "verified" && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                                <Button
                                    variant="secondary"
                                    onClick={handleDownloadReceipt}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    Download Receipt
                                </Button>
                            </div>
                        )}

                        {/* Payment Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Amount</span>
                                    <span>{formatCurrency(payment.amount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                                    <span>Total</span>
                                    <span className="text-green-600">{formatCurrency(payment.amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
