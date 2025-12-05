import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Edit2, Trash2, MapPin, Building2, Store as StoreIcon, Eye, ChevronDown, ChevronUp } from "lucide-react"
import toast from "react-hot-toast"
import { MainLayout } from "@/components/layout/MainLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal, ConfirmModal } from "@/components/ui/Modal"
import { FormModal } from "@/components/ui/FormModal"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setStores, addStore, updateStore, deleteStore } from "@/redux/slices/adminSlice"

// Store Card Component
const StoreCard = ({ store, onView, onEdit, onDelete }) => {
  const productCount = store.products?.length || 0
  const totalStock = store.products?.reduce((sum, p) => sum + p.qty, 0) || 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
            {store.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Building2 size={12} />
            {store.companyId?.name || 'No Company'}
          </p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
          <StoreIcon size={20} className="text-blue-600" />
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
        <MapPin size={12} />
        <span className="truncate">{store.location}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-4">
        <div className="text-center">
          <p className="text-xl font-bold text-blue-600">{productCount}</p>
          <p className="text-xs text-gray-500">Products</p>
        </div>
        <div className="w-px h-8 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-xl font-bold text-green-600">{totalStock}</p>
          <p className="text-xs text-gray-500">Stock</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onView(store)}
          className="flex-1 flex items-center justify-center gap-1"
        >
          <Eye size={14} />
          View Details
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(store)
          }}
          className="flex items-center justify-center gap-1"
        >
          <Edit2 size={14} />
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(store)
          }}
          className="flex items-center justify-center gap-1"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  )
}

export const Stores = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { stores, companies } = useAppSelector((state) => state.admin)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    companyId: "",
    landingPage: {
      hero: {
        heading: "",
        subheading: "",
        heroImage: "",
      },
      navbar: {
        logoImage: "",
      },
      footer: {
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        phone: "",
        email: "",
      }
    }
  })
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    hero: true,
    navbar: false,
    footer: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  useEffect(() => {
    // Only fetch if stores are not already loaded
    if (stores.length === 0) {
      fetchStores()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch companies if not loaded
    if (companies.length === 0) {
      fetchCompanies()
    }
  }, [])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/store")
      if (response?.data?.data) {
        dispatch(setStores(response.data.data))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch stores")
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/company")
      if (response?.data?.data) {
        dispatch({ type: 'admin/setCompanies', payload: response.data.data })
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    }
  }

  const handleViewStore = (store) => {
    navigate(`/admin/stores/${store.id}`)
  }

  const handleEditStore = (store) => {
    setSelectedStore(store)
    setIsEditMode(true)
    setFormData({
      name: store.name,
      email: store.email,
      password: "",
      location: store.location,
      companyId: store.companyId?.id || "",
      landingPage: store.landingPage || {
        hero: { heading: "", subheading: "", heroImage: "" },
        navbar: { logoImage: "" },
        footer: {
          address: { street: "", city: "", state: "", zipCode: "", country: "" },
          phone: "",
          email: "",
        }
      }
    })
    setIsModalOpen(true)
  }

  const handleDeleteStore = (store) => {
    setStoreToDelete(store)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!storeToDelete) return

    setIsProcessing(true)
    try {
      await axiosInstance.delete(`/store/${storeToDelete.id}`)
      dispatch(deleteStore(storeToDelete.id))
      toast.success("Store deleted successfully!")
      setDeleteModalOpen(false)
      setStoreToDelete(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete store")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddStore = () => {
    setIsEditMode(false)
    setSelectedStore(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      location: "",
      companyId: "",
      landingPage: {
        hero: {
          heading: "",
          subheading: "",
          heroImage: "",
        },
        navbar: {
          logoImage: "",
        },
        footer: {
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          phone: "",
          email: "",
        }
      }
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      if (isEditMode && selectedStore) {
        // Update store
        const updateData = { ...formData }
        if (!updateData.password) {
          delete updateData.password
        }
        const response = await axiosInstance.put(`/store/${selectedStore.id}`, updateData)
        dispatch(updateStore(response.data.data))
        toast.success("Store updated successfully!")
      } else {
        // Create new store
        const response = await axiosInstance.post("/store", formData)
        dispatch(addStore(response.data.data))
        toast.success("Store created successfully!")
      }
      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} store`)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      location: "",
      companyId: "",
    })
    setSelectedStore(null)
    setIsEditMode(false)
  }

  return (
    <MainLayout
      header={
        <PageHeader
          title="Store Management"
          subtitle="Manage all stores in the system"
          icon={StoreIcon}
          actions={
            <Button
              variant="primary"
              onClick={handleAddStore}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Store
            </Button>
          }
        />
      }
    >
      <div className="space-y-6">

        {/* Stores Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <StoreIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No stores found</p>
            <p className="text-gray-400 text-sm mt-2">Create your first store to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onView={handleViewStore}
                onEdit={handleEditStore}
                onDelete={handleDeleteStore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Store Modal */}
      <FormModal
        isOpen={isModalOpen}
        size="lg"
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Edit Store" : "Add New Store"}
        onSubmit={handleSubmit}
        submitLabel={isEditMode ? "Update Store" : "Create Store"}
        cancelLabel="Cancel"
        isProcessing={isProcessing}
      >
        {/* Scrollable Content */}
        <div className="space-y-4">
          <Input
            label="Store Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter store name"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="store@example.com"
          />
          <Input
            label={isEditMode ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!isEditMode}
            placeholder="Enter password"
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            placeholder="Enter location"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Landing Page Customization - Interactive Sections */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Landing Page Customization</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Optional</span>
            </div>

            {/* Hero Section - Collapsible */}
            <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('hero')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    1
                  </div>
                  <span className="font-medium text-gray-900">Hero Section</span>
                </div>
                {expandedSections.hero ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.hero && (
                <div className="p-4 space-y-3 bg-white">
                  <Input
                    label="Hero Heading"
                    value={formData.landingPage?.hero?.heading || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingPage: {
                        ...formData.landingPage,
                        hero: { ...formData.landingPage?.hero, heading: e.target.value }
                      }
                    })}
                    placeholder="e.g., Welcome to Our Store"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subheading</label>
                    <textarea
                      value={formData.landingPage?.hero?.subheading || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        landingPage: {
                          ...formData.landingPage,
                          hero: { ...formData.landingPage?.hero, subheading: e.target.value }
                        }
                      })}
                      placeholder="Brief description of your store..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <Input
                    label="Hero Image URL"
                    value={formData.landingPage?.hero?.heroImage || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingPage: {
                        ...formData.landingPage,
                        hero: { ...formData.landingPage?.hero, heroImage: e.target.value }
                      }
                    })}
                    placeholder="/images/hero.png"
                  />
                </div>
              )}
            </div>

            {/* Navbar Section - Collapsible */}
            <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('navbar')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                    2
                  </div>
                  <span className="font-medium text-gray-900">Navbar Logo</span>
                </div>
                {expandedSections.navbar ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.navbar && (
                <div className="p-4 bg-white">
                  <Input
                    label="Logo Image URL"
                    value={formData.landingPage?.navbar?.logoImage || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingPage: {
                        ...formData.landingPage,
                        navbar: { logoImage: e.target.value }
                      }
                    })}
                    placeholder="/images/logo.png"
                  />
                </div>
              )}
            </div>

            {/* Footer Section - Collapsible */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('footer')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                    3
                  </div>
                  <span className="font-medium text-gray-900">Footer Information</span>
                </div>
                {expandedSections.footer ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.footer && (
                <div className="p-4 space-y-3 bg-white">
                  <Input
                    label="Street Address"
                    value={formData.landingPage?.footer?.address?.street || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingPage: {
                        ...formData.landingPage,
                        footer: {
                          ...formData.landingPage?.footer,
                          address: { ...formData.landingPage?.footer?.address, street: e.target.value }
                        }
                      }
                    })}
                    placeholder="123 Main St"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="City"
                      value={formData.landingPage?.footer?.address?.city || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        landingPage: {
                          ...formData.landingPage,
                          footer: {
                            ...formData.landingPage?.footer,
                            address: { ...formData.landingPage?.footer?.address, city: e.target.value }
                          }
                        }
                      })}
                      placeholder="City"
                    />
                    <Input
                      label="State"
                      value={formData.landingPage?.footer?.address?.state || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        landingPage: {
                          ...formData.landingPage,
                          footer: {
                            ...formData.landingPage?.footer,
                            address: { ...formData.landingPage?.footer?.address, state: e.target.value }
                          }
                        }
                      })}
                      placeholder="State"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Zip Code"
                      value={formData.landingPage?.footer?.address?.zipCode || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        landingPage: {
                          ...formData.landingPage,
                          footer: {
                            ...formData.landingPage?.footer,
                            address: { ...formData.landingPage?.footer?.address, zipCode: e.target.value }
                          }
                        }
                      })}
                      placeholder="12345"
                    />
                    <Input
                      label="Country"
                      value={formData.landingPage?.footer?.address?.country || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        landingPage: {
                          ...formData.landingPage,
                          footer: {
                            ...formData.landingPage?.footer,
                            address: { ...formData.landingPage?.footer?.address, country: e.target.value }
                          }
                        }
                      })}
                      placeholder="Country"
                    />
                  </div>
                  <Input
                    label="Footer Phone"
                    value={formData.landingPage?.footer?.phone || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingPage: {
                        ...formData.landingPage,
                        footer: { ...formData.landingPage?.footer, phone: e.target.value }
                      }
                    })}
                    placeholder="+1 (555) 123-4567"
                  />
                  <Input
                    label="Footer Email"
                    type="email"
                    value={formData.landingPage?.footer?.email || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      landingPage: {
                        ...formData.landingPage,
                        footer: { ...formData.landingPage?.footer, email: e.target.value }
                      }
                    })}
                    placeholder="contact@store.com"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setStoreToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Store"
        message={`Are you sure you want to delete "${storeToDelete?.name}"? This action cannot be undone and will also delete all associated products.`}
        confirmText="Delete Store"
        variant="danger"
        isLoading={isProcessing}
      />
    </MainLayout>
  )
}