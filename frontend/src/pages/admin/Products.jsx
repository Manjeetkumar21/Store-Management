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
    description: "",
    dimensionLength: "",
    dimensionWidth: "",
    dimensionHeight: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
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

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file")
        return
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }
      setImageFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  // Upload image to backend
  const uploadProductImage = async (productId) => {
    if (!imageFile) return null

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await axiosInstance.put(`/upload/product/${productId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      return response.data.data.image
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error("Failed to upload image")
      return null
    } finally {
      setIsUploadingImage(false)
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
        dimensions: {
          length: formData.dimensionLength ? parseFloat(formData.dimensionLength) : null,
          width: formData.dimensionWidth ? parseFloat(formData.dimensionWidth) : null,
          height: formData.dimensionHeight ? parseFloat(formData.dimensionHeight) : null,
        },
      }
      let productId
      let productData
      if (editingProduct) {
        // Update existing product
        const response = await axiosInstance.put(`/product/${editingProduct.id}`, payload)
        productData = response.data.data
        productId = editingProduct.id

        // Upload image if new one selected
        if (imageFile) {
          const imageUrl = await uploadProductImage(productId)
          if (imageUrl) {
            productData.image = imageUrl
          }
        }

        dispatch(updateProduct(productData))
        toast.success("Product updated successfully")
      } else {
        // Create new product
        const response = await axiosInstance.post("/product", payload)
        productData = response.data.data
        productId = productData.id

        // Upload image if selected
        if (imageFile) {
          const imageUrl = await uploadProductImage(productId)
          if (imageUrl) {
            productData.image = imageUrl
          }
        }

        dispatch(addProduct(productData))
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
      storeId: product.storeId?.id || product.storeId || "",
      description: product.description || "",
      dimensionLength: product.dimensions?.length?.toString() || "",
      dimensionWidth: product.dimensions?.width?.toString() || "",
      dimensionHeight: product.dimensions?.height?.toString() || "",
    })
    setImagePreview(product.image || "")
    setImageFile(null)
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
      productId: product.id,
      productName: product.name
    })
  }

  const resetForm = () => {
    setFormData({ name: "", price: "", stock: "", category: "", brand: "", storeId: "", description: "", dimensionLength: "", dimensionWidth: "", dimensionHeight: "" })
    setEditingProduct(null)
    setIsModalOpen(false)
    setImageFile(null)
    setImagePreview("")
    setIsUploadingImage(false)
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
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div className="space-y-3">
                {/* Image Preview */}
                {(imagePreview || editingProduct?.image) && (
                  <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || editingProduct?.image}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {isUploadingImage && (
                    <span className="text-sm text-blue-600">Uploading...</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Supported: JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            </div>

            {/* Dimensions (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (Optional)</label>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Length (cm)"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.dimensionLength}
                  onChange={(e) => setFormData({ ...formData, dimensionLength: e.target.value })}
                />
                <Input
                  label="Width (cm)"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.dimensionWidth}
                  onChange={(e) => setFormData({ ...formData, dimensionWidth: e.target.value })}
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.dimensionHeight}
                  onChange={(e) => setFormData({ ...formData, dimensionHeight: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Enter product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
