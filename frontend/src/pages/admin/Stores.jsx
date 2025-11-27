import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, MapPin } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table } from "@/components/ui/Table"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setStores, addStore, deleteStore } from "@/redux/slices/adminSlice"

export const Stores = () => {
  const dispatch = useAppDispatch()
  const { stores, companies } = useAppSelector((state) => state.admin)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    companyId: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      // Fetch all companies first to get their IDs
      const companiesRes = await axiosInstance.get("/company")
      if (companiesRes.data.data.length > 0) {
        const storesRes = await axiosInstance.get(`/store/company/${companiesRes.data.data[0]._id}`)
        dispatch(setStores(storesRes.data.data))
      }
    } catch (error) {
      toast.error("Failed to fetch stores")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password || !formData.companyId) {
      toast.error("Please fill all fields")
      return
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        location: formData.address || "",
        address: formData.address,
        companyId: formData.companyId,
        password: formData.password,
      }
      const response = await axiosInstance.post("/store", payload)
      dispatch(addStore(response.data.data))
      toast.success("Store added successfully")
      setFormData({ name: "", email: "", password: "", address: "", companyId: "" })
      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add store")
    }
  }

  const handleDelete = async (storeId) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return
    try {
      await axiosInstance.delete(`/store/${storeId}`)
      dispatch(deleteStore(storeId))
      toast.success("Store deleted successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete store")
    }
  }

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

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Table
            headers={["Store Name", "Email", "Address", "Actions"]}
            data={stores}
            loading={loading}
            renderRow={(store) => (
              <>
                <td className="px-6 py-4 text-gray-900 font-medium">{store.name}</td>
                <td className="px-6 py-4 text-gray-600">{store.email}</td>
                <td className="px-6 py-4 text-gray-600 flex items-center gap-1">
                  <MapPin size={16} />
                  {store.address}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(store._id)}
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

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Store" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Store Name"
              placeholder="Enter store name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="store@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Password"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
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
            <Button type="submit" variant="primary" className="w-full">
              Add Store
            </Button>
          </form>
        </Modal>
      </div>
    </MainLayout>
  )
}
