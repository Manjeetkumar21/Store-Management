import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Package, X } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ConfirmModal } from "@/components/ui/Modal"
import { FormModal } from "@/components/ui/FormModal"
import { Table } from "@/components/ui/Table"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setProducts, addProduct, updateProduct, deleteProduct, setStores } from "@/redux/slices/adminSlice"
import { formatCurrency } from "../../utils/currency"
import { ProductFormModal } from "@/components/admin/ProductFormModal"

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
      if (file.size > 1 * 1024 * 1024) {
        toast.error("Image size should be less than 1MB")
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

  const handleEdit = (product) => {
    console.log("Prodcut : ",product)
    setEditingProduct(product)
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

  const handleProductSuccess = (productData, action) => {
    if (action === 'create') {
      dispatch(addProduct(productData))
    } else if (action === 'update') {
      dispatch(updateProduct(productData))
    }
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
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(null)
          }}
          onSuccess={handleProductSuccess}
          editingProduct={editingProduct}
          stores={stores}
        />

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
