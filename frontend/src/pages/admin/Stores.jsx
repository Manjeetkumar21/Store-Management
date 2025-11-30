import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, MapPin, Building2, Package, ArrowLeft, Store as StoreIcon, ShoppingBag, TrendingUp } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setStores, addStore, deleteStore } from "@/redux/slices/adminSlice"

// Store Details Page Component
const StoreDetailsPage = ({ store, onBack }) => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Store ID: {store._id}</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Edit2 size={18} />
            Edit Store
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Package size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{store.products?.length || 0}</div>
            <div className="text-blue-100 text-sm">Total Products</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">
              {store.products?.reduce((sum, p) => sum + p.qty, 0) || 0}
            </div>
            <div className="text-green-100 text-sm">Total Stock</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">
              ₹{store.products?.reduce((sum, p) => sum + (p.price * p.qty), 0).toLocaleString() || 0}
            </div>
            <div className="text-purple-100 text-sm">Inventory Value</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Building2 size={20} />
              </div>
            </div>
            <div className="text-lg font-bold mb-1">{store.companyId?.name || 'N/A'}</div>
            <div className="text-orange-100 text-sm">Company</div>
          </div>
        </div>

        {/* Store & Company Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <StoreIcon size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Store Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                <p className="text-gray-900 mt-1">{store.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
                <p className="text-gray-900 mt-1 flex items-center gap-1">
                  <MapPin size={16} className="text-gray-400" />
                  {store.location}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Address</label>
                <p className="text-gray-900 mt-1">{store.address}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                <p className="text-gray-900 mt-1">
                  {new Date(store.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={20} className="text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Company Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Company Name</label>
                <p className="text-gray-900 mt-1 text-lg font-semibold">{store.companyId?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                <p className="text-gray-900 mt-1">{store.companyId?.description || 'No description available'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Company ID</label>
                <p className="text-gray-600 mt-1 text-sm font-mono">{store.companyId?._id || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Products Inventory</h2>
          </div>
          {store.products && store.products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {store.products.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-lg font-bold text-gray-900">₹{product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className={`text-lg font-bold ${product.qty > 10 ? 'text-green-600' :
                          product.qty > 5 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                        {product.qty}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No products available in this store</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

// Compact Store Card Component
const CompactStoreCard = ({ store, onClick }) => {
  const productCount = store.products?.length || 0
  const totalStock = store.products?.reduce((sum, p) => sum + p.qty, 0) || 0

  return (
    <div
      onClick={() => onClick(store)}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {store.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Building2 size={12} />
            {store.companyId?.name}
          </p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
          <StoreIcon size={18} className="text-blue-600" />
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
        <MapPin size={12} />
        <span className="truncate">{store.location}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">{productCount}</p>
          <p className="text-xs text-gray-500">Products</p>
        </div>
        <div className="w-px h-8 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">{totalStock}</p>
          <p className="text-xs text-gray-500">Stock</p>
        </div>
      </div>
    </div>
  )
}

// Main Stores List Component
export const Stores = () => {
  const dispatch = useAppDispatch()
  const { stores, companies } = useAppSelector((state) => state.admin)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    companyId: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch if stores are not already loaded
    if (stores.length === 0) {
      fetchStores()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/store")

      if (response?.data?.data) {
        dispatch(setStores(response.data.data))
      } else {
        toast.error("No store data found")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch stores")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.companyId) {
      toast.error("Please fill all required fields")
      return
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      location: formData.address || "",
      address: formData.address,
      companyId: formData.companyId,
      password: formData.password,
    }

    axiosInstance.post("/store", payload)
      .then((response) => {
        dispatch(addStore(response.data.data))
        toast.success("Store added successfully")
        setFormData({ name: "", email: "", password: "", address: "", companyId: "" })
        setIsModalOpen(false)
        fetchStores()
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to add store")
      })
  }

  const handleDelete = async (storeId, e) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this store?")) return

    try {
      await axiosInstance.delete(`/store/${storeId}`)
      dispatch(deleteStore(storeId))
      toast.success("Store deleted successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete store")
    }
  }

  // If a store is selected, show details page
  if (selectedStore) {
    return <StoreDetailsPage store={selectedStore} onBack={() => setSelectedStore(null)} />
  }

  // Otherwise show stores list
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
            <p className="text-gray-600 mt-1">Manage all stores across companies</p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} />
            Add Store
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading stores...</p>
            </div>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <StoreIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first store</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Add Store
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stores.map((store) => (
              <div key={store._id} className="relative group">
                <CompactStoreCard store={store} onClick={setSelectedStore} />
                <button
                  onClick={(e) => handleDelete(store._id, e)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                >
                  <Trash2 size={14} className="text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Store" size="lg">
          <div className="space-y-4">
            <Input
              label="Store Name *"
              placeholder="Enter store name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="store@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Password *"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Input
              label="Address"
              placeholder="Enter store address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleSubmit} variant="primary" className="w-full">
              Add Store
            </Button>
          </div>
        </Modal>
      </div>
    </MainLayout>
  )
}