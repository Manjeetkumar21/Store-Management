import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Package, Download, CheckCircle2 } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { OrderStatusBadge } from "@/components/OrderStatusBadge"
import { ConfirmModal } from "@/components/ui/Modal"
import { formatCurrency } from "@/utils/currency"
import axiosInstance from "@/api/axiosInstance"
import toast from "react-hot-toast"

export const Orders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get("/order/my")
      setOrders(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReceived = async () => {
    if (!confirmModal.orderId) return

    setIsProcessing(true)
    try {
      await axiosInstance.patch(`/order/${confirmModal.orderId}/received`)
      toast.success("Order marked as received!")
      setConfirmModal({ isOpen: false, orderId: null })
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm order")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/payment/${paymentId}/receipt`)
      const receiptData = response.data.data

      // Create a simple receipt display
      const receiptWindow = window.open('', '_blank')
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

  console.log("orders", orders)
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={32} />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">Start shopping to create your first order</p>
            <Button
              variant="primary"
              onClick={() => navigate("/store/products")}
              className="mt-4"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
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
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                  <ul className="space-y-1">
                    {order.products.map((item, index) => (
                      <li key={index} className="text-sm text-gray-900">
                        {item.qty}x {item.productId?.name || "Product"} - ₹
                        {(item.price * item.qty)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  {/* Proceed to Payment - Show when order is confirmed and payment is pending */}
                  {order.status === "confirmed" && order.paymentStatus === "pending" && (
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/store/payment/${order.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Package size={16} />
                      Proceed to Payment
                    </Button>
                  )}

                  {/* Download Receipt - Show when payment is verified */}
                  {order.paymentStatus === "verified" && order.paymentId && (
                    <Button
                      variant="secondary"
                      onClick={() => handleDownloadReceipt(order.paymentId)}
                      className="flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download Receipt
                    </Button>
                  )}

                  {/* Confirm Received - Show when order is shipped */}
                  {order.shippingStatus === "shipped" && !order.orderReceivedConfirmation && (
                    <Button
                      variant="primary"
                      onClick={() => setConfirmModal({ isOpen: true, orderId: order.id })}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      Confirm Received
                    </Button>
                  )}

                  {/* View Details */}
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/store/orders/${order.id}`)}
                    className="ml-auto"
                  >
                    View Details
                  </Button>
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

        {/* Confirm Received Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, orderId: null })}
          onConfirm={handleConfirmReceived}
          title="Confirm Order Received"
          message="Have you received this order in good condition? This action confirms that the order has been delivered successfully and will mark it as completed."
          confirmText="Yes, I Received It"
          cancelText="Not Yet"
          variant="primary"
          isLoading={isProcessing}
        />
      </div>
    </MainLayout>
  )
}
