import { cn } from "@/lib/utils"

export const PageHeader = ({
    title,
    subtitle,
    icon: Icon,
    actions,
    className
}) => {
    return (
        <div className={cn(
            "bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0",
            className
        )}>
            <div className="flex items-center justify-between">
                {/* Left: Title and Subtitle */}
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Icon className="text-blue-600" size={24} />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Right: Action Buttons */}
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}
