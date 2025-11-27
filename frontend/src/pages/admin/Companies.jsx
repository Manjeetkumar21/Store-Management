import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Modal } from "@/components/ui/Modal"
import { Table } from "@/components/ui/Table"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setCompanies, addCompany } from "@/redux/slices/adminSlice"

export const Companies = () => {
  const dispatch = useAppDispatch()
  const { companies } = useAppSelector((state) => state.admin)
  const { user } = useAppSelector((state) => state.auth)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", description: "" })
  const [loading, setLoading] = useState(true)

  console.log("user : ", user)
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/company")
      dispatch(setCompanies(response.data.data))
    } catch (error) {
      toast.error("Failed to fetch companies")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error("Please fill all fields")
      return
    }

    try {
      const payload = {
        ...formData,
        createdBy: user.id,
      }

      const response = await axiosInstance.post("/company", payload)
      dispatch(addCompany(response.data.data))
      toast.success("Company added successfully")
      setFormData({ name: "", email: "", description: "" })
      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add company")
    }
  }


  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600 mt-1">Manage all companies in the system</p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} />
            Add Company
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Table
            headers={["Company Name", "Logo", "Actions"]}
            data={companies}
            loading={loading}
            renderRow={(company) => (
              <>
                <td className="px-6 py-4 text-gray-900 font-medium">{company?.name}</td>
                <td className="px-6 py-4 text-gray-600">{company?.email}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Company">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Company Name"
              placeholder="Enter company name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="company@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Textarea
              label="Description"
              name="description"
              placeholder="Provide a brief description of the company..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Button type="submit" variant="primary" className="w-full">
              Add Company
            </Button>
          </form>
        </Modal>
      </div>
    </MainLayout>
  )
}
