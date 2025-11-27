import React from "react"
import { cn } from "@/lib/utils"


export const Input = React.forwardRef(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              icon && "pl-10",
              error && "border-red-500 focus:ring-red-500",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    )
  },
)
Input.displayName = "Input"
