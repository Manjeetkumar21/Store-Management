import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { clearCart } from "@/redux/slices/cartSlice"

export const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.cart)
  const { user } = useAppSelector((state) => state.auth)

  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping")
  const [loading, setLoading] = useState(false)
  const [shippingData, setShippingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  })

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = 10
  const total = subtotal + tax + shipping

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    if (!shippingData.fullName || !shippingData.email || !shippingData.address || !shippingData.city) {
      toast.error("Please fill all shipping details")
      return
    }
    setStep("payment")
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setLoading(true)
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: shippingData,
        total,
        subtotal,
        tax,
        shipping,
      }

      await axiosInstance.post("/order/create", orderData)

      dispatch(clearCart())
      setStep("confirmation")
      toast.success("Order placed successfully!")

      setTimeout(() => {
        navigate("/store/orders")
      }, 2000)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  if (step === "confirmation") {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
            <p className="text-2xl font-bold text-blue-600 mb-8">Total: ${total.toFixed(2)}</p>
            <Button variant="primary" onClick={() => navigate("/store/orders")} className="w-full">
              View My Orders
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/store/cart")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft size={20} />
          Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step === "shipping" ? "bg-blue-600" : "bg-green-600"}`}
                >
                  1
                </div>
                <div className={`flex-1 h-1 ${step !== "shipping" ? "bg-blue-600" : "bg-gray-300"}`} />
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step === "payment" ? "bg-blue-600" : step === "confirmation" ? "bg-green-600" : "bg-gray-300"}`}
                >
                  2
                </div>
              </div>

              {step === "shipping" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      value={shippingData.fullName}
                      onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="john@example.com"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                    />
                    <Input
                      label="Phone Number"
                      placeholder="+1 (555) 123-4567"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    />
                    <Input
                      label="Address"
                      placeholder="123 Main Street"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        placeholder="New York"
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      />
                      <Input
                        label="ZIP Code"
                        placeholder="10001"
                        value={shippingData.zipCode}
                        onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                      />
                    </div>
                    <Button type="submit" variant="primary" className="w-full">
                      Continue to Payment
                    </Button>
                  </form>
                </div>
              )}

              {step === "payment" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" checked onChange={() => {}} className="w-4 h-4" />
                        <span className="font-medium text-gray-900">Credit Card</span>
                      </label>
                    </div>
                    <div className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 transition-colors">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" onChange={() => {}} className="w-4 h-4" />
                        <span className="font-medium text-gray-900">PayPal</span>
                      </label>
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">Card Details (Demo)</p>
                      <Input label="Card Number" placeholder="4532 1234 5678 9010" disabled />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <Input label="Expiry" placeholder="12/25" disabled />
                        <Input label="CVV" placeholder="123" disabled />
                      </div>
                    </div>
                    <Button variant="primary" className="w-full" isLoading={loading} onClick={handlePlaceOrder}>
                      Place Order
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setStep("shipping")}
                      disabled={loading}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.title} x {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
