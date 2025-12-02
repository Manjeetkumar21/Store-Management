import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Package } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal, ConfirmModal } from "@/components/ui/Modal"
import { Table } from "@/components/ui/Table"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setProducts, addProduct, updateProduct, deleteProduct, setStores } from "@/redux/slices/adminSlice"
import { formatCurrency } from "../../utils/currency"

export const Products = () => {
  const dispatch = useAppDispatch()
  const { products, stores } = useAppSelector((state) => state.admin)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: "" })
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    storeId: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch if data is not already loaded
    if (stores.length === 0) {
      fetchStores()
    }
    if (products.length === 0) {
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchStores = async () => {
    try {
      const response = await axiosInstance.get("/store")
      dispatch(setStores(response.data.data))
    } catch (error) {
      toast.error("Failed to fetch stores")
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get(`/product`)
      dispatch(setProducts(response.data.data))
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.storeId) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        storeId: formData.storeId,
        category: formData.category,
        brand: formData.brand,
        qty: formData.stock ? parseInt(formData.stock) : 0,
        description: formData.description || "",
      }

      if (editingProduct) {
        // Update existing product
        const response = await axiosInstance.put(`/product/${editingProduct._id}`, payload)
        dispatch(updateProduct(response.data.data))
        toast.success("Product updated successfully")
      } else {
        // Create new product
        const response = await axiosInstance.post("/product", payload)
        dispatch(addProduct(response.data.data))
        toast.success("Product added successfully")
      }

      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingProduct ? 'update' : 'add'} product`)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.qty?.toString() || "",
      category: product.category || "",
      brand: product.brand || "",
      storeId: product.storeId?._id || product.storeId || "",
    })
    setIsModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId) return

    setIsDeleting(true)
    try {
      await axiosInstance.delete(`/product/${deleteModal.productId}`)
      dispatch(deleteProduct(deleteModal.productId))
      toast.success("Product deleted successfully")
      setDeleteModal({ isOpen: false, productId: null, productName: "" })
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteModal = (product) => {
    setDeleteModal({
      isOpen: true,
      productId: product._id,
      productName: product.name
    })
  }

  const resetForm = () => {
    setFormData({ name: "", price: "", stock: "", category: "", brand: "", storeId: "" })
    setEditingProduct(null)
    setIsModalOpen(false)
  }

  return (
    <MainLayout
      header={
        <PageHeader
          title="Products"
          subtitle="Manage all products across stores"
          icon={Package}
          actions={
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Plus size={20} />
              Add Product
            </Button>
          }
        />
      }
    >
      <div className="space-y-6">

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Table
            headers={["Product Name", "Price", "Store", "Category", "Actions"]}
            data={products}
            loading={loading}
            renderRow={(product) => (
              <>
                <td className="px-6 py-4 text-gray-900 font-medium">{product.name}</td>
                <td className="px-6 py-4 text-gray-900 flex items-center gap-1">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4 text-gray-600">{product.storeId?.name || 'Unknown Store'}</td>
                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(product)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
        </div>

        {/* Add/Edit Product Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={resetForm}
          title={editingProduct ? "Edit Product" : "Add New Product"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Product Name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                label="Stock"
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Category"
                placeholder="e.g., Electronics"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <Input
                label="Brand"
                placeholder="e.g., Samsung"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                required
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="cursor-pointer"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: "" })}
          onConfirm={handleDeleteConfirm}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteModal.productName}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </MainLayout>
  )
}
