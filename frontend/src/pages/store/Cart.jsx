import { Trash2, Plus, Minus, ShoppingBag, Loader2, IndianRupee } from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import axiosInstance from "@/api/axiosInstance"
import { useEffect, useState } from "react"
import { useAppDispatch } from "@/redux/hooks"
import { setCart } from "@/redux/slices/cartSlice"

// Define the shape of a transformed cart item for local state
// This simplifies the structure pulled from the nested API response.
// The API item looks like: { productId: { name, brand, price, ... }, qty, price }
const transformItem = (item) => ({
  productId: item.productId.id,
  title: item.productId.name,
  brand: item.productId.brand,
  category: item.productId.category,
  dimensions: item.productId.dimensions, // Product dimensions
  price: item.price, // Item price in the cart structure
  quantity: item.qty, // Item quantity in the cart structure
  image: item.productId.image, // Product image URL
})

export const Cart = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // --- Utility Calculations ---

  // Calculate totals from the current local state 'items'
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const taxRate = 0.1 // 10% tax
  const tax = subtotal * taxRate
  const total = subtotal + tax

  // --- API Handlers ---

  const fetchCart = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get(`/cart`)
      const cartItemsFromAPI = response.data.cart.items

      // Transform the nested API data into a flat, usable array
      const transformedItems = cartItemsFromAPI.map(transformItem)

      setItems(transformedItems)
      dispatch(setCart(transformedItems))
    } catch (err) {
      toast.error("Failed to fetch cart details.")
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change

    if (newQuantity < 1) {
      handleRemoveItem(productId)
      return
    }

    // Optimistic Update: Update the local state immediately for a smooth experience
    setItems(prevItems => prevItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ))

    try {
      await axiosInstance.put(`/cart`, {
        productId,
        qty: newQuantity
      })
      toast.success("Cart quantity updated.")
    } catch (err) {
      toast.error("Failed to update cart. Reverting changes.")
      // Revert state on failure by re-fetching the server's true state
      fetchCart()
    }
  }

  const handleRemoveItem = async (productId) => {
    // Optimistic Update: Remove item from local state immediately
    setItems(prevItems => prevItems.filter(item => item.productId !== productId))

    try {
      await axiosInstance.delete(`/cart/item/${productId}`)
      toast.success("Item removed from cart.")
    } catch (err) {
      toast.error("Failed to remove item. Restoring cart.")
      fetchCart()
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items to proceed.")
      return
    }
    navigate("/store/checkout")
  }

  // --- Lifecycle Hook ---
  useEffect(() => {
    fetchCart()
  }, [])

  // --- Render Logic ---

  // 1. Loading State
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
          <p className="text-xl text-gray-700 font-medium">Fetching your cart...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag size={32} className="text-blue-600" /> Shopping Cart
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Your items are waiting.</p>
        </div>

        {/* 2. Empty Cart State */}
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white shadow-lg rounded-xl border-4 border-dashed border-gray-200">
            <p className="text-gray-500 text-xl font-medium mb-4">Your cart is currently empty.</p>
            <Button
              variant="primary"
              onClick={() => navigate("/store/products")}
              className="mt-4 text-lg px-8 py-3"
            >
              Start Shopping Now
            </Button>
          </div>
        ) : (
          /* 3. Cart with Items Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* --- Cart Items List (Column 1) --- */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Review Items ({items.length})</h2>

              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white shadow-md rounded-xl hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                >
                  {/* Image/Placeholder */}
                  <div className="w-full sm:w-24 h-32 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </div>

                  {/* Product Details (Enhanced) */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <h3 className="font-bold text-lg text-gray-900 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500">Brand: <span className="font-semibold">{item.brand}</span></p>
                    {item.dimensions && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span>📏</span>
                        <span>
                          {item.dimensions.length} x {item.dimensions.width} x {item.dimensions.height}
                        </span>
                      </p>
                    )}
                    <p className="text-xl text-blue-600 font-bold mt-1">₹{item.price}</p>
                  </div>

                  {/* Quantity Controls & Actions - Mobile Stack */}
                  <div className="flex sm:flex-row flex-col items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center gap-1 border border-gray-300 rounded-full p-1 bg-gray-50">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <span className="px-4 text-lg font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-center sm:text-right sm:w-24 flex-shrink-0">
                      <p className="font-bold text-xl text-gray-900">
                        ₹{(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-full transition-colors self-center"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Order Summary (Column 2) --- */}
            <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 h-fit lg:sticky lg:top-24 border border-blue-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-3">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-lg text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-lg text-gray-600">
                  <span>Tax ({taxRate * 100}%)</span>
                  <span className="font-semibold text-gray-800">₹{tax}</span>
                </div>
                <div className="flex items-center justify-between text-lg text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="font-bold text-xl text-gray-900">Order Total</span>
                <span className="text-xl font-bold text-blue-600">₹{total}</span>
              </div>

              {/* Checkout Buttons */}
              <Button
                variant="primary"
                className="w-full mt-8 mb-3 text-lg py-3"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="secondary"
                className="w-full text-lg py-3"
                onClick={() => navigate("/store/products")}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}