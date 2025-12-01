import { Bell, Settings, Menu } from "lucide-react"

export const TopBar = ({ onMenuClick }) => {
  return (
    <div className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-20">
      <div className="flex items-center gap-4">
        {/* Hamburger menu button - visible only on mobile */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
          <Bell size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
          <Settings size={20} />
        </button>
      </div>
    </div>
  )
}
