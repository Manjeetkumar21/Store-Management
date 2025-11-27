import { TrendingUp, TrendingDown } from "lucide-react"

export const StatCard = ({ title, value, icon, color, change }) => {
  
  const colorMap = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-500",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      border: "border-green-500",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      border: "border-purple-500",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-500",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
      border: "border-red-500",
    },
  }

  const theme = colorMap[color] || colorMap.blue

  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString() 
    : value;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-shadow duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between">
        
        {/* Icon and Title */}
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${theme.bg} ${theme.text}`}>
            {icon}
          </div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{formattedValue}</p>
      </div>

      {/* Optional Change Indicator */}
      {change !== undefined && (
        <div className="mt-3 flex items-center">
          {change > 0 ? (
            <TrendingUp size={16} className="text-green-500 mr-1" />
          ) : change < 0 ? (
            <TrendingDown size={16} className="text-red-500 mr-1" />
          ) : null}
          <p className={`text-sm font-semibold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {change !== 0 ? `${Math.abs(change).toFixed(1)}%` : 'No Change'}
          </p>
          <p className="text-xs text-gray-500 ml-2">vs last period</p>
        </div>
      )}
    </div>
  )
}