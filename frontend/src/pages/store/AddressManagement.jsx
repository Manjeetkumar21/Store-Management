import { useState, useEffect } from "react";
import { Plus, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AddressCard } from "@/components/AddressCard";
import { ConfirmModal } from "@/components/ui/Modal";
import axiosInstance from "@/api/axiosInstance";
import { useAppSelector } from "@/redux/hooks";

export const AddressManagement = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAppSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await axiosInstance.get("/address");
            setAddresses(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch addresses");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.zipCode) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingAddress) {
                await axiosInstance.put(`/address/${editingAddress.id}`, formData);
                toast.success("Address updated successfully");
            } else {
                await axiosInstance.post("/address", formData);
                toast.success("Address added successfully");
            }

            setShowForm(false);
            setEditingAddress(null);
            resetForm();
            fetchAddresses();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save address");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || "",
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
        });
        setShowForm(true);
    };

    const handleDeleteClick = (id) => {
        setDeletingId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/address/${deletingId}`);
            toast.success("Address deleted successfully");
            setShowDeleteModal(false);
            setDeletingId(null);
            fetchAddresses();
        } catch (error) {
            toast.error("Failed to delete address");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await axiosInstance.patch(`/address/${id}/default`);
            toast.success("Default address updated");
            fetchAddresses();
        } catch (error) {
            toast.error("Failed to set default address");
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: "",
            phone: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            zipCode: "",
            country: "India",
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingAddress(null);
        resetForm();
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <MapPin size={32} />
                            Delivery Addresses
                        </h1>
                        <p className="text-gray-600 mt-2">Manage your delivery addresses</p>
                    </div>
                    {!showForm && (
                        <Button
                            variant="primary"
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Add New Address
                        </Button>
                    )}
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingAddress ? "Edit Address" : "Add New Address"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name *"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                                <Input
                                    label="Phone Number *"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Address Line 1 *"
                                placeholder="Street address, P.O. box"
                                value={formData.addressLine1}
                                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                            />

                            <Input
                                label="Address Line 2"
                                placeholder="Apartment, suite, unit, building, floor, etc."
                                value={formData.addressLine2}
                                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="City *"
                                    placeholder="Mumbai"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                                <Input
                                    label="State *"
                                    placeholder="Maharashtra"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                                <Input
                                    label="ZIP Code *"
                                    placeholder="400001"
                                    value={formData.zipCode}
                                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Country *"
                                placeholder="India"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            />

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting} className="cursor-pointer">
                                    {editingAddress ? "Update Address" : "Save Address"}
                                </Button>
                                <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSubmitting} className="cursor-pointer">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading addresses...</p>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">No addresses found</p>
                        <p className="text-gray-400 text-sm mt-2">Add your first delivery address to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onSetDefault={handleSetDefault}
                                showActions={true}
                            />
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeletingId(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Address"
                    message="Are you sure you want to delete this address? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                    isLoading={isDeleting}
                />
            </div>
        </MainLayout>
    );
};
