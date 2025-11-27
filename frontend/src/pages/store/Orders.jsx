import { useEffect, useState } from "react"
import { Package, Clock, CheckCircle } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import axiosInstance from "@/api/axiosInstance"
import toast from "react-hot-toast"

export const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    fetchOrders()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-600" size={20} />
      case "confirmed":
        return <CheckCircle className="text-blue-600" size={20} />
      case "delivered":
        return <CheckCircle className="text-green-600" size={20} />
      default:
        return <Package className="text-gray-600" size={20} />
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h3>
                    <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-medium text-gray-900 capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Items:</p>
                  <ul className="space-y-1">
                    {order.items.map((item, index) => (
                      <li key={index} className="text-sm text-gray-900">
                        {item.quantity}x Product - ${(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Shipping to:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
