import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit2, MapPin, Building2, Package, ShoppingBag, TrendingUp, Store as StoreIcon, Mail, Trash2, Calendar, Tag, Layers } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { Modal, ConfirmModal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import axiosInstance from "@/api/axiosInstance"
import { formatCurrency } from "@/utils/currency"

export const StoreDetails = () => {
    const { storeId } = useParams()
    const navigate = useNavigate()
    const [store, setStore] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        location: "",
    })

    useEffect(() => {
        fetchStoreDetails()
    }, [storeId])

    const fetchStoreDetails = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/store/${storeId}`)
            setStore(response.data.data)
            setFormData({
                name: response.data.data.name,
                email: response.data.data.email,
                location: response.data.data.location,
            })
        } catch (error) {
            toast.error("Failed to fetch store details")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStore = async (e) => {
        e.preventDefault()
        setIsProcessing(true)
        try {
            await axiosInstance.put(`/store/${storeId}`, formData)
            toast.success("Store updated successfully!")
            setEditModalOpen(false)
            fetchStoreDetails()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update store")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDeleteStore = async () => {
        setIsProcessing(true)
        try {
            await axiosInstance.delete(`/store/${storeId}`)
            toast.success("Store deleted successfully!")
            navigate("/admin/stores")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete store")
            setIsProcessing(false)
        }
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading store details...</p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    if (!store) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-64">
                    <StoreIcon size={64} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4 text-lg">Store not found</p>
                    <Button onClick={() => navigate("/admin/stores")}>
                        Back to Stores
                    </Button>
                </div>
            </MainLayout>
        )
    }

    const totalProducts = store.products?.length || 0
    const totalStock = store.products?.reduce((sum, p) => sum + p.qty, 0) || 0
    const inventoryValue = store.products?.reduce((sum, p) => sum + (p.price * p.qty), 0) || 0

    return (
        <MainLayout>
            <div className="space-y-6 pb-8">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate("/admin/stores")}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                        >
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <StoreIcon size={28} className="text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
                                    <p className="text-gray-500 text-sm mt-1">Store ID: {store._id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Mail size={16} />
                                    <span>{store.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    <span>{store.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>Created {new Date(store.createdAt).toLocaleDateString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setEditModalOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <Edit2 size={18} />
                                Edit
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => setDeleteModalOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Card 1: Blue */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Package size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-bold mb-1">{totalProducts}</div>
                            <div className="text-blue-100 text-sm font-medium tracking-wide">Total Products</div>
                        </div>
                    </div>

                    {/* Card 2: Green */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <ShoppingBag size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-4xl font-bold mb-1">{totalStock}</div>
                            <div className="text-emerald-100 text-sm font-medium tracking-wide">Total Stock</div>
                        </div>
                    </div>

                    {/* Card 3: Purple */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <TrendingUp size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-bold mb-1">{formatCurrency(inventoryValue)}</div>
                            <div className="text-purple-100 text-sm font-medium tracking-wide">Inventory Value</div>
                        </div>
                    </div>

                    {/* Card 4: Orange */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Building2 size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <div className="text-xl font-bold mb-1 truncate">{store.companyId?.name || 'N/A'}</div>
                            <div className="text-orange-100 text-sm font-medium tracking-wide">Company</div>
                        </div>
                    </div>
                </div>

                {/* Company Information */}
                {store.companyId && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={20} className="text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company Name</label>
                                <p className="text-gray-900 mt-1 font-semibold text-lg">{store.companyId.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                <p className="text-gray-900 mt-1 flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    {store.companyId.email}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company ID</label>
                                <p className="text-gray-500 mt-1 text-sm font-mono">{store.companyId._id}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Section - Enhanced Cards */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Package size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Product Inventory</h2>
                                    <p className="text-sm text-gray-600 mt-0.5">{totalProducts} {totalProducts === 1 ? 'product' : 'products'} in stock</p>
                                </div>
                            </div>
                            {totalProducts > 0 && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Value</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(inventoryValue)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {store.products && store.products.length > 0 ? (
                        <div className="p-6 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {store.products.map((product) => (
                                    <div
                                        key={product._id}
                                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        {/* Product Image */}
                                        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-48 flex items-center justify-center">
                                                    <Package size={64} className="text-gray-400" />
                                                </div>
                                            )}

                                            {/* Stock Badge */}
                                            <div className="absolute top-3 right-3">
                                                {product.qty > 20 ? (
                                                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                                                        In Stock
                                                    </span>
                                                ) : product.qty > 0 ? (
                                                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full shadow-lg">
                                                        Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>

                                            {/* Category Badge */}
                                            {product.category && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-lg flex items-center gap-1">
                                                        <Layers size={12} />
                                                        <span className="capitalize">{product.category}</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-5">
                                            {/* Product Name */}
                                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                {product.name}
                                            </h3>

                                            {/* Brand */}
                                            {product.brand && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                                                    <Tag size={14} className="text-gray-400" />
                                                    <span className="font-medium">{product.brand}</span>
                                                </div>
                                            )}

                                            {/* Description */}
                                            {product.description && (
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                                    {product.description}
                                                </p>
                                            )}

                                            {/* Price Section */}
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Unit Price</p>
                                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(product.price)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Quantity</p>
                                                        <p className="text-2xl font-bold text-green-600">{product.qty}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total Value */}
                                            <div className="bg-blue-500 rounded-lg p-3 text-center flex items-center justify-between">
                                                <p className="text-sm font-semibold text-white uppercase tracking-wide mb-1">Total Inventory Value</p>
                                                <p className="text-xl font-bold text-white">
                                                    {formatCurrency(product.price * product.qty)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-16 text-center bg-gray-50">
                            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Package size={48} className="text-gray-300" />
                            </div>
                            <p className="text-gray-900 text-xl font-semibold mb-2">No products available</p>
                            <p className="text-gray-500 text-sm">Products will appear here once added to this store</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Store"
            >
                <form onSubmit={handleUpdateStore} className="space-y-4">
                    <Input
                        label="Store Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setEditModalOpen(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isProcessing}
                            disabled={isProcessing}
                        >
                            Update Store
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteStore}
                title="Delete Store"
                message={`Are you sure you want to delete "${store.name}"? This action cannot be undone and will also delete all associated products.`}
                confirmText="Delete Store"
                variant="danger"
                isLoading={isProcessing}
            />
        </MainLayout>
    )
}
