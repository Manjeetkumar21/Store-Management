import React from "react"
import { cn } from "@/lib/utils"

export const Textarea = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea
          ref={ref}
          rows={4} // Default rows for the textarea
          className={cn(
            "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none", // resize-none prevents manual resizing
            error && "border-red-500 focus:ring-red-500",
            className,
          )}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";