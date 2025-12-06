import { useState, useEffect } from "react"
import { Package, X } from "lucide-react"
import toast from "react-hot-toast"
import { FormModal } from "@/components/ui/FormModal"
import { Input } from "@/components/ui/Input"
import axiosInstance from "@/api/axiosInstance"

/**
 * Reusable Product Form Modal Component
 * Used for creating and editing products in both Products and StoreDetails pages
 */
export const ProductFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    editingProduct = null,
    stores = [],
    preselectedStoreId = null, // For StoreDetails page - auto-select store
}) => {
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        stock: "",
        category: "",
        brand: "",
        storeId: preselectedStoreId || "",
        description: "",
        dimensionLength: "",
        dimensionWidth: "",
        dimensionHeight: "",
    })


    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(editingProduct?.image || "")
    const [isUploadingImage, setIsUploadingImage] = useState(false)


    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name || "",
                price: editingProduct.price?.toString() || "",
                stock: editingProduct.qty?.toString() || "",
                category: editingProduct.category || "",
                brand: editingProduct.brand || "",
                storeId: editingProduct.storeId?.id || editingProduct.storeId || preselectedStoreId || "",
                description: editingProduct.description || "",
                dimensionLength: editingProduct.dimensions?.length?.toString() || "",
                dimensionWidth: editingProduct.dimensions?.width?.toString() || "",
                dimensionHeight: editingProduct.dimensions?.height?.toString() || "",
            })

            setImagePreview(editingProduct.image || "")
        }
    }, [editingProduct, preselectedStoreId])
    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file")
                return
            }
            // Validate file size (1MB max)
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
            const formDataUpload = new FormData()
            formDataUpload.append('image', imageFile)

            const response = await axiosInstance.put(`/upload/product/${productId}/upload`, formDataUpload, {
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

                toast.success("Product added successfully")
            }

            // Call success callback with product data
            if (onSuccess) {
                onSuccess(productData, editingProduct ? 'update' : 'create')
            }

            handleClose()
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${editingProduct ? 'update' : 'add'} product`)
        }
    }

    const handleClose = () => {
        // Reset form
        setFormData({
            name: "",
            price: "",
            stock: "",
            category: "",
            brand: "",
            storeId: preselectedStoreId || "",
            description: "",
            dimensionLength: "",
            dimensionWidth: "",
            dimensionHeight: "",
        })
        setImageFile(null)
        setImagePreview("")
        setIsUploadingImage(false)
        onClose()
    }

    return (
        <FormModal
            isOpen={isOpen}
            onClose={handleClose}
            title={editingProduct ? "Edit Product" : "Add New Product"}
            size="xl"
            onSubmit={handleSubmit}
            submitLabel={editingProduct ? "Update Product" : "Add Product"}
            cancelLabel="Cancel"
            isProcessing={isUploadingImage}
        >
            <div className="space-y-5">
                {/* Basic Information Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">Basic Information</h3>

                    <Input
                        label="Product Name"
                        placeholder="Enter product name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <Input
                            label="Stock Quantity"
                            type="number"
                            placeholder="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Category"
                            placeholder="e.g., Electronics, Furniture"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                        <Input
                            label="Brand"
                            placeholder="e.g., Samsung, Apple"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={formData.storeId}
                            onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                            disabled={!!preselectedStoreId} // Disable if preselected (from StoreDetails)
                            required
                        >
                            <option value="">Select a store</option>
                            {stores.map((store) => (
                                <option key={store.id} value={store.id}>
                                    {store.name}
                                </option>
                            ))}
                        </select>
                        {preselectedStoreId && (
                            <p className="text-xs text-gray-500 mt-1">Store is pre-selected and cannot be changed</p>
                        )}
                    </div>
                </div>

                {/* Product Image Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Product Image</label>
                    <div className="space-y-3">
                        {/* Image Preview */}
                        {(imagePreview || editingProduct?.image) && (
                            <div className="relative w-full h-56 bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden group">
                                <img
                                    src={imagePreview || editingProduct?.image}
                                    alt="Product preview"
                                    className="w-full h-full object-contain p-2"
                                />
                                {/* Remove Image Button */}
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null)
                                            setImagePreview("")
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* File Input */}
                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer">
                                <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">
                                    <div className="text-center">
                                        <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {imagePreview || editingProduct?.image ? "Change Image" : "Upload Image"}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP (Max 1MB)</p>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            {isUploadingImage && (
                                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 py-2 rounded">
                                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                    <span>Uploading image...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dimensions Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                        Dimensions <span className="text-xs font-normal text-gray-500">(Optional)</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
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

                {/* Description Section */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Description <span className="text-xs font-normal text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Enter product description, features, or specifications..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                    />
                    <p className="text-xs text-gray-500">
                        {formData.description.length} characters
                    </p>
                </div>
            </div>
        </FormModal>
    )
}
