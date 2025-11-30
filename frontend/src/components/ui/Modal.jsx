import { X } from "lucide-react";
import { Button } from "./Button";

export const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText = "Confirm", cancelText = "Cancel", confirmVariant = "primary", isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={isLoading}
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {children}
                </div>

                {/* Footer */}
                {onConfirm && (
                    <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={confirmVariant}
                            onClick={onConfirm}
                            className="flex-1"
                            isLoading={isLoading}
                        >
                            {confirmText}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Confirmation Modal
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", variant = "primary", isLoading = false }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            onConfirm={onConfirm}
            confirmText={confirmText}
            cancelText={cancelText}
            confirmVariant={variant}
            isLoading={isLoading}
        >
            <p className="text-gray-700">{message}</p>
        </Modal>
    );
};
