import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Plus, MapPin, Package, CheckCircle2, Edit3 } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AddressCard } from "@/components/AddressCard"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { clearCart } from "@/redux/slices/cartSlice"

export const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.cart)

  const [step, setStep] = useState("address")
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressFormData, setAddressFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = 0 // Free shipping
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + shipping + tax

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get("/address")
      const addressList = response.data.data
      setAddresses(addressList)

      // Auto-select default address
      const defaultAddr = addressList.find(addr => addr.isDefault)
      if (defaultAddr) {
        setSelectedAddress(defaultAddr)
      }
    } catch (error) {
      toast.error("Failed to fetch addresses")
    }
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()

    if (!addressFormData.fullName || !addressFormData.phone || !addressFormData.addressLine1 ||
      !addressFormData.city || !addressFormData.state || !addressFormData.zipCode) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const response = await axiosInstance.post("/address", addressFormData)
      toast.success("Address added successfully")
      setAddresses([...addresses, response.data.data])
      setSelectedAddress(response.data.data)
      setShowAddressForm(false)
      resetAddressForm()
    } catch (error) {
      toast.error("Failed to add address")
    }
  }

  const resetAddressForm = () => {
    setAddressFormData({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    })
  }

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address")
      return
    }
    setStep("review")
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address")
      return
    }

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setLoading(true)
    try {
      const response = await axiosInstance.post("/order", {
        addressId: selectedAddress.id,
      })

      dispatch(clearCart())
      toast.success("Order placed successfully!")
      navigate(`/store/orders`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-blue-50/30 -mt-6 -mx-6 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/store/cart")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Cart
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Steps */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                      step === "address" ? "bg-blue-600 shadow-lg shadow-blue-200" : "bg-green-500"
                    }`}>
                      {step === "address" ? <MapPin size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Delivery Address</p>
                      <p className="text-xs text-gray-500">Where to deliver</p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className={`h-1 w-1/2 mx-4 rounded-full transition-all ${
                    step === "review" ? "bg-blue-600" : "bg-gray-200"
                  }`} />

                  {/* Step 2 */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                      step === "review" ? "bg-blue-600 shadow-lg shadow-blue-200" : "bg-gray-300"
                    }`}>
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Review Order</p>
                      <p className="text-xs text-gray-500">Final confirmation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Selection Step */}
              {step === "address" && (
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                      <p className="text-sm text-gray-600 mt-1">Choose where you want your order delivered</p>
                    </div>
                  </div>

                  {showAddressForm ? (
                    <div className="mb-6 rounded-xl p-6 border-2 border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-blue-600" />
                        Add New Address
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Full Name *"
                            value={addressFormData.fullName}
                            onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                            placeholder="John Doe"
                          />
                          <Input
                            label="Phone *"
                            value={addressFormData.phone}
                            onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <Input
                          label="Address Line 1 *"
                          value={addressFormData.addressLine1}
                          onChange={(e) => setAddressFormData({ ...addressFormData, addressLine1: e.target.value })}
                          placeholder="House no, Building name"
                        />
                        <Input
                          label="Address Line 2"
                          value={addressFormData.addressLine2}
                          onChange={(e) => setAddressFormData({ ...addressFormData, addressLine2: e.target.value })}
                          placeholder="Road name, Area, Colony"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="City *"
                            value={addressFormData.city}
                            onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                            placeholder="Mumbai"
                          />
                          <Input
                            label="State *"
                            value={addressFormData.state}
                            onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                            placeholder="Maharashtra"
                          />
                          <Input
                            label="ZIP Code *"
                            value={addressFormData.zipCode}
                            onChange={(e) => setAddressFormData({ ...addressFormData, zipCode: e.target.value })}
                            placeholder="400001"
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button onClick={handleAddressSubmit} variant="primary" className="flex-1">
                            Save Address
                          </Button>
                          <Button onClick={() => setShowAddressForm(false)} variant="secondary" className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => setShowAddressForm(true)}
                      className="mb-6 w-full md:w-auto flex items-center justify-center gap-2 hover:cursor-pointer"
                    >
                      <Plus size={18} />
                      Add New Address
                    </Button>
                  )}

                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No addresses found</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first delivery address to continue</p>
                      </div>
                    ) : (
                      addresses.map((address) => (
                        <AddressCard
                          key={address.id}
                          address={address}
                          isSelected={selectedAddress?.id === address.id}
                          onSelect={setSelectedAddress}
                          selectable={true}
                          showActions={false}
                        />
                      ))
                    )}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mt-8 h-12 text-base font-semibold"
                    onClick={handleContinueToPayment}
                    disabled={!selectedAddress}
                  >
                    Continue to Review
                  </Button>
                </div>
              )}

              {/* Review Step */}
              {step === "review" && (
                <div className="space-y-6">
                  {/* Delivery Address */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <MapPin size={20} className="text-blue-600" />
                        Delivery Address
                      </h3>
                      <button
                        onClick={() => setStep("address")}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-colors"
                      >
                        <Edit3 size={16} />
                        Change
                      </button>
                    </div>
                    {selectedAddress && (
                      <AddressCard address={selectedAddress} showActions={false} />
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                      <Package size={20} className="text-blue-600" />
                      Order Items ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.productId} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setStep("address")}
                      disabled={loading}
                      className="w-32"
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 h-12 text-base font-semibold"
                      isLoading={loading}
                      onClick={handlePlaceOrder}
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm sticky top-6">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (GST 18%)</span>
                    <span className="font-semibold">₹{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t-2 border-gray-100 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-lg">Total</span>
                      <span className="font-bold text-blue-600 text-2xl">₹{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}