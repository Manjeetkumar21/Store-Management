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
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`relative overflow-hidden bg-white rounded-lg shadow-xl w-full ${sizes[size]} max-h-[95vh] sm:max-h-[90vh] flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center bg-blue-400 text-white justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold truncate pr-2">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full transition-colors cursor-pointer active:scale-110 active:bg-blue-500 flex-shrink-0"
              type="button"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </div>

            {/* Fixed Footer with CTA Buttons */}
            {showFooter && (
              <div className="bg-white border-t border-gray-200 p-4 sm:p-6">
                {footerContent || (
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                      disabled={isProcessing}
                      className="w-full sm:w-auto"
                    >
                      {cancelLabel}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isProcessing}
                      disabled={isProcessing}
                      className="w-full sm:w-auto"
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
