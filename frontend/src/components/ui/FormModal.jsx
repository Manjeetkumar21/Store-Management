"use client"

import { X } from "lucide-react"
import { Button } from "./Button"

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isProcessing = false,
  showFooter = true,
  footerContent = null
}) {
  if (!isOpen) return null

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`relative overflow-hidden bg-white rounded-lg shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>

            {/* Fixed Footer with CTA Buttons */}
            {showFooter && (
              <div className="bg-white border-t border-gray-200 p-6">
                {footerContent || (
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                      disabled={isProcessing}
                    >
                      {cancelLabel}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isProcessing}
                      disabled={isProcessing}
                    >
                      {submitLabel}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
