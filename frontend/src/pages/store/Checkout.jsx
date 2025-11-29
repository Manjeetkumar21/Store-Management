import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Plus } from "lucide-react"
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
        addressId: selectedAddress._id,
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
      <div className="max-w-6xl mx-auto space-y-6">
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
              {/* Progress Steps */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step === "address" ? "bg-blue-600" : "bg-green-600"
                  }`}>
                  1
                </div>
                <div className={`flex-1 h-1 ${step !== "address" ? "bg-blue-600" : "bg-gray-300"}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step === "review" ? "bg-blue-600" : "bg-gray-300"
                  }`}>
                  2
                </div>
              </div>

              {/* Address Selection Step */}
              {step === "address" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Delivery Address</h2>

                  {showAddressForm ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
                      <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Full Name *"
                            value={addressFormData.fullName}
                            onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                          />
                          <Input
                            label="Phone *"
                            value={addressFormData.phone}
                            onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                          />
                        </div>
                        <Input
                          label="Address Line 1 *"
                          value={addressFormData.addressLine1}
                          onChange={(e) => setAddressFormData({ ...addressFormData, addressLine1: e.target.value })}
                        />
                        <Input
                          label="Address Line 2"
                          value={addressFormData.addressLine2}
                          onChange={(e) => setAddressFormData({ ...addressFormData, addressLine2: e.target.value })}
                        />
                        <div className="grid grid-cols-3 gap-4">
                          <Input
                            label="City *"
                            value={addressFormData.city}
                            onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                          />
                          <Input
                            label="State *"
                            value={addressFormData.state}
                            onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                          />
                          <Input
                            label="ZIP *"
                            value={addressFormData.zipCode}
                            onChange={(e) => setAddressFormData({ ...addressFormData, zipCode: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button type="submit" variant="primary">Save Address</Button>
                          <Button type="button" variant="secondary" onClick={() => setShowAddressForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => setShowAddressForm(true)}
                      className="mb-6 flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add New Address
                    </Button>
                  )}

                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No addresses found. Please add one.</p>
                    ) : (
                      addresses.map((address) => (
                        <AddressCard
                          key={address._id}
                          address={address}
                          isSelected={selectedAddress?._id === address._id}
                          onSelect={setSelectedAddress}
                          selectable={true}
                          showActions={false}
                        />
                      ))
                    )}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mt-6"
                    onClick={handleContinueToPayment}
                    disabled={!selectedAddress}
                  >
                    Continue to Review
                  </Button>
                </div>
              )}

              {/* Review Step */}
              {step === "review" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Order</h2>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                    {selectedAddress && (
                      <AddressCard address={selectedAddress} showActions={false} />
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() => setStep("address")}
                    >
                      Change Address
                    </Button>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm py-2 border-b">
                          <span className="text-gray-700">{item.title} x {item.quantity}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      className="flex-1"
                      isLoading={loading}
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setStep("address")}
                      disabled={loading}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
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
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
