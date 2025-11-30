import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit2, MapPin, Building2, Package, ShoppingBag, TrendingUp, Store as StoreIcon, Mail, Trash2 } from "lucide-react"
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
                    <p className="text-gray-500">Loading store details...</p>
                </div>
            </MainLayout>
        )
    }

    if (!store) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-gray-500 mb-4">Store not found</p>
                    <Button onClick={() => navigate("/admin/stores")}>
                        Back to Stores
                    </Button>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/stores")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
                        <p className="text-gray-500 text-sm mt-1">Store ID: {store._id}</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setEditModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Edit2 size={18} />
                        Edit Store
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
                            {formatCurrency(store.products?.reduce((sum, p) => sum + (p.price * p.qty), 0) || 0)}
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
                                <p className="text-gray-900 mt-1 flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    {store.email}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
                                <p className="text-gray-900 mt-1 flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" />
                                    {store.location}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">Created At</label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(store.createdAt).toLocaleDateString('en-IN', {
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
                            <Building2 size={20} className="text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Company Information</h2>
                        </div>
                        {store.companyId ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Company Name</label>
                                    <p className="text-gray-900 mt-1 font-semibold">{store.companyId.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Company Email</label>
                                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        {store.companyId.email}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Company ID</label>
                                    <p className="text-gray-500 mt-1 text-sm font-mono">{store.companyId._id}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No company information available</p>
                        )}
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={20} className="text-blue-600" />
                        Products ({store.products?.length || 0})
                    </h2>
                    {store.products && store.products.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {store.products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(product.price)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{product.qty}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                {formatCurrency(product.price * product.qty)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No products available</p>
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
