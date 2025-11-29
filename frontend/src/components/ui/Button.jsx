import React from "react"
import { cn } from "@/lib/utils"


export const Button = React.forwardRef(
  ({ className, variant = "primary", size = "md", isLoading = false, children, ...props }, ref) => {
    const baseStyles = "font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      danger: "bg-red-500 text-white hover:bg-red-600",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? "Loading..." : children}
      </button>
    )
  },
)
Button.displayName = "Button"
