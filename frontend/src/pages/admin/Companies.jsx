import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Building2, Store, Mail, Calendar, ChevronDown, ChevronUp, Search, Loader2, AlertCircle, TrendingUp, X, CheckCircle2, AlertTriangle } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import axiosInstance from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setCompanies, addCompany } from "@/redux/slices/adminSlice"
import toast from "react-hot-toast"

export const Companies = () => {
  const dispatch = useAppDispatch()
  const { companies } = useAppSelector((state) => state.admin)
  const { user } = useAppSelector((state) => state.auth)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [expandedCompany, setExpandedCompany] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: "", email: "", description: "" })
  const [editingCompany, setEditingCompany] = useState(null)
  const [deletingCompany, setDeletingCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    // Only fetch if companies are not already loaded
    if (companies.length === 0) {
      fetchCompanies()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axiosInstance.get("/company")
      dispatch(setCompanies(response.data.data))
    } catch (error) {
      toast.error("Failed to fetch companies. Please try again.")
      console.error("Error fetching companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      if (editingCompany) {
        // Update existing company
        const response = await axiosInstance.put(`/company/${editingCompany._id}`, formData)
        toast.success("Company updated successfully!")
      } else {
        // Add new company
        const payload = {
          ...formData,
          createdBy: user.id,
        }
        const response = await axiosInstance.post("/company", payload)
        dispatch(addCompany(response.data.data))
        toast.success("Company added successfully!")
      }

      setFormData({ name: "", email: "", description: "" })
      setEditingCompany(null)
      setIsModalOpen(false)
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${editingCompany ? 'update' : 'add'} company. Please try again.`)
      console.error(`Error ${editingCompany ? 'updating' : 'adding'} company:`, error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      email: company.email,
      description: company.description || ""
    })
    setIsModalOpen(true)
    setError(null)
  }

  const handleDeleteConfirm = (company) => {
    setDeletingCompany(company)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingCompany) return

    try {
      setSubmitting(true)
      setError(null)

      await axiosInstance.delete(`/company/${deletingCompany._id}`)
      toast.success("Company deleted successfully!")
      setIsDeleteModalOpen(false)
      setDeletingCompany(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete company. Please try again.")
      console.error("Error deleting company:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCompany(null)
    setFormData({ name: "", email: "", description: "" })
    setError(null)
  }

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalStores = companies.reduce((acc, c) => acc + (c.stores?.length || 0), 0)
  const avgStores = companies.length > 0 ? (totalStores / companies.length).toFixed(1) : 0

  return (
    <MainLayout>
      <div className="h-full p-4 md:p-8">
        <div className="max-w-full mx-auto space-y-6 md:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Building2 className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Companies
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">Manage and monitor your business portfolio</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus size={20} />
              <span>Add Company</span>
            </button>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-green-800 font-medium">Success</p>
                <p className="text-green-600 text-sm mt-1">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Companies</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{companies.length}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Stores</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalStores}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Growing</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Store className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Stores/Company</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{avgStores}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Calendar size={14} className="text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">Per unit</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search companies by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl bg-gray-50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-md">
              <Loader2 className="text-blue-600 animate-spin mb-4" size={48} />
              <p className="text-gray-600 font-medium">Loading companies...</p>
            </div>
          )}

          {/* Companies List */}
          {!loading && (
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <div
                  key={company._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 md:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                          <Building2 className="text-white" size={24} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{company.name}</h3>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{company.description || "No description provided"}</p>
                          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-3">
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                              <Mail size={16} className="text-blue-600 flex-shrink-0" />
                              <span className="truncate">{company.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                              <Store size={16} className="text-green-600 flex-shrink-0" />
                              <span className="font-medium">{company.stores?.length || 0} {company.stores?.length === 1 ? 'Store' : 'Stores'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                              <Calendar size={16} className="text-purple-600 flex-shrink-0" />
                              <span>{formatDate(company.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-end md:justify-start">
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Edit company"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(company)}
                          className="p-3 hover:bg-red-50 text-red-600 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Delete company"
                        >
                          <Trash2 size={18} />
                        </button>
                        {company.stores?.length > 0 && (
                          <button
                            onClick={() => setExpandedCompany(expandedCompany === company._id ? null : company._id)}
                            className="p-3 hover:bg-gray-100 text-gray-600 rounded-xl transition-all duration-200 ml-2"
                            title={expandedCompany === company._id ? "Hide stores" : "Show stores"}
                          >
                            {expandedCompany === company._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Stores Section */}
                    {expandedCompany === company._id && company.stores?.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200 animate-in slide-in-from-top duration-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <Store size={16} className="text-green-600" />
                          Store Locations ({company.stores.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {company.stores.map((store) => (
                            <div
                              key={store._id}
                              className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-gray-900 truncate">{store.name}</h5>
                                  <p className="text-sm text-gray-600 mt-1 truncate">{store.location}</p>
                                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 truncate">
                                    <Mail size={12} className="flex-shrink-0" />
                                    <span className="truncate">{store.email}</span>
                                  </p>
                                </div>
                                <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0 ml-2">
                                  <Store size={16} className="text-green-600" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredCompanies.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md">
              <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first company"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  <Plus size={20} />
                  Add Your First Company
                </button>
              )}
            </div>
          )}

          {/* Add/Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {editingCompany ? 'Edit Company' : 'Add New Company'}
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        {editingCompany ? 'Update company details' : 'Fill in the details to create a new company'}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={submitting}
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter company name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="company@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Provide a brief description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          {editingCompany ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        editingCompany ? 'Update Company' : 'Add Company'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
                <div className="p-6">
                  <div className="flex flex-col items-center justify-center  gap-4">
                    <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                      <AlertTriangle className="text-red-600" size={30} />
                    </div>
                    <div className="flex-1 text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Company</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Are you sure you want to delete <span className="font-semibold text-gray-900">"{deletingCompany?.name}"</span>?
                        This action cannot be undone and will also remove all associated stores.
                      </p>

                      {deletingCompany?.stores?.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                          <p className="text-amber-800 text-sm font-medium">
                            ⚠️ This will delete {deletingCompany.stores.length} {deletingCompany.stores.length === 1 ? 'store' : 'stores'}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setIsDeleteModalOpen(false)
                            setDeletingCompany(null)
                          }}
                          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={submitting}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={18} />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}