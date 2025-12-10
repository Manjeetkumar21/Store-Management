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
              <div class="row">
                <span class="label">Store Name:</span>
                <span>${payment?.store?.name ? payment?.store?.name : 'Unknown'}</span>
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
                    <th>Breadth (cm)</th>
                    <th>Height (cm)</th>

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
                      <td>${item.width}</td>
                      <td>${item.height}</td>

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
            <div className="space-y-4 md:space-y-6 pb-8">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate("/admin/payments")}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors self-start"
                        >
                            <ArrowLeft size={20} className="text-gray-700 sm:w-6 sm:h-6" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <div className="p-2 sm:p-3 bg-green-50 rounded-lg self-start">
                                    <CreditCard size={20} className="text-green-600 sm:w-7 sm:h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">Payment #{payment.id.slice(-8).toUpperCase()}</h1>
                                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                                        Created on {new Date(payment.createdAt).toLocaleDateString('en-IN')} at {new Date(payment.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <div className="sm:hidden mt-3">
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                            </div>
                        </div>
                        <div className="hidden sm:block text-right">
                            <p className="text-2xl md:text-3xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
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
                        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
                            <div className="space-y-3 md:space-y-4">
                                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        <div>
                                            <p className="text-xs md:text-sm text-gray-600 mb-1">Payment Method</p>
                                            <p className="font-semibold text-gray-900 text-sm md:text-base">
                                                {payment.paymentMethod.toUpperCase().replace("_", " ")}
                                            </p>
                                        </div>
                                        {payment.transactionId && (
                                            <div>
                                                <p className="text-xs md:text-sm text-gray-600 mb-1">Transaction ID</p>
                                                <p className="font-mono font-semibold text-gray-900 text-xs md:text-sm break-all">
                                                    {payment.transactionId}
                                                </p>
                                            </div>
                                        )}
                                        {payment.paidAt && (
                                            <div>
                                                <p className="text-xs md:text-sm text-gray-600 mb-1">Paid At</p>
                                                <p className="text-gray-900 text-xs md:text-sm">
                                                    {new Date(payment.paidAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {payment.verifiedAt && (
                                            <div>
                                                <p className="text-xs md:text-sm text-gray-600 mb-1">Verified At</p>
                                                <p className="text-gray-900 text-xs md:text-sm">
                                                    {new Date(payment.verifiedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {payment.notes && (
                                    <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-xs md:text-sm font-medium text-yellow-900 mb-1">Verification Notes:</p>
                                        <p className="text-xs md:text-sm text-yellow-700">{payment.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Related Order Information */}
                        {payment.orderId && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Related Order</h2>
                                <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm md:text-base">
                                                Order #{payment.orderId.id?.slice(-8).toUpperCase() || "N/A"}
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-600 mt-1">
                                                Store: {payment?.store?.name || "Unknown"}
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-600">
                                                Status: {payment.orderId.status || "N/A"}
                                            </p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => navigate(`/admin/orders/${payment.orderId.id || payment.orderId}`)}
                                            className="flex items-center gap-2 w-full sm:w-auto text-xs md:text-sm"
                                        >
                                            <Eye size={14} className="md:w-4 md:h-4" />
                                            View Order
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Verification Actions */}
                        {payment.status === "submitted" && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Verify Payment</h3>
                                <div className="space-y-3 md:space-y-4">
                                    <Input
                                        label="Verification Notes (Optional)"
                                        placeholder="Add notes about verification..."
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                    />
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            variant="primary"
                                            onClick={() => handleVerifyPayment(true)}
                                            disabled={isProcessing}
                                            isLoading={isProcessing}
                                            className="flex-1 flex items-center justify-center gap-2 text-sm md:text-base"
                                        >
                                            <CheckCircle size={14} className="md:w-4 md:h-4" />
                                            Verify
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleVerifyPayment(false)}
                                            disabled={isProcessing}
                                            className="flex-1 flex items-center justify-center gap-2 text-sm md:text-base"
                                        >
                                            <XCircle size={14} className="md:w-4 md:h-4" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Download Receipt */}
                        {payment.status === "verified" && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Actions</h3>
                                <Button
                                    variant="secondary"
                                    onClick={handleDownloadReceipt}
                                    className="w-full flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    <Download size={14} className="md:w-4 md:h-4" />
                                    Download Receipt
                                </Button>
                            </div>
                        )}

                        {/* Payment Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Payment Summary</h3>
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm md:text-base">
                                    <span>Amount</span>
                                    <span>{formatCurrency(payment.amount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base md:text-lg pt-2 md:pt-3 border-t border-gray-200">
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
