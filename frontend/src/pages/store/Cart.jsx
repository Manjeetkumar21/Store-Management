import { Trash2, Plus, Minus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { updateCartItem, removeFromCart } from "@/redux/slices/cartSlice"

export const Cart = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.cart)

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }
    navigate("/store/checkout")
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">Review and manage your items</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <Button variant="primary" onClick={() => navigate("/store/products")} className="mt-4">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cart Items ({items.length})</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-gray-400">Image</div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-blue-600 font-semibold">${item.price}</p>
                    </div>

                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          dispatch(
                            updateCartItem({
                              productId: item.productId,
                              quantity: item.quantity - 1,
                            }),
                          )
                        }
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(
                            updateCartItem({
                              productId: item.productId,
                              quantity: item.quantity + 1,
                            }),
                          )
                        }
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => {
                        dispatch(removeFromCart(item.productId))
                        toast.success("Item removed from cart")
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
              </div>
              <Button variant="primary" className="w-full mb-2" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => navigate("/store/products")}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
