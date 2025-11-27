import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table } from "@/components/ui/Table"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setProducts, addProduct, deleteProduct } from "@/redux/slices/adminSlice"

export const Products = () => {
  const dispatch = useAppDispatch()
  const { products, stores } = useAppSelector((state) => state.admin)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      if (stores.length > 0) {
        const response = await axiosInstance.get(`/product`)
        dispatch(setProducts(response.data.data))
      }
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

    const response = await axiosInstance.post("/product", payload)
    dispatch(addProduct(response.data.data))
    toast.success("Product added successfully")
    setFormData({ name: "", price: "", stock: "", category: "", brand: "", storeId: "" })
    setIsModalOpen(false)
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to add product")
  }
}


  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    try {
      await axiosInstance.delete(`/product/${productId}`)
      dispatch(deleteProduct(productId))
      toast.success("Product deleted successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product")
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage all products across stores</p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} />
            Add Product
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Table
            headers={["Product Name", "Price", "Stock", "Category", "Actions"]}
            data={products}
            loading={loading}
            renderRow={(product) => (
              <>
                <td className="px-6 py-4 text-gray-900 font-medium">{product.name}</td>
                <td className="px-6 py-4 text-gray-900 flex items-center gap-1">
                  <DollarSign size={16} />
                  {product.price}
                </td>
                <td className="px-6 py-4 text-gray-600">{product.stock} units</td>
                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Product Name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Add Product
            </Button>
          </form>
        </Modal>
      </div>
    </MainLayout>
  )
}
