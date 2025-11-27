"use client"

import type React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={cn("bg-white rounded-lg p-6 w-full mx-4", sizes[size])}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
