import { Bell, Settings, Menu, Home } from "lucide-react"
import { Link } from "react-router-dom"
import { useAppSelector } from "@/redux/hooks"

export const TopBar = ({ onMenuClick }) => {
  const { user } = useAppSelector((state) => state.auth)
  const landingPageLink = user?.role === "admin" ? "/admin" : "/store"

  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-20">
      <div className="flex items-center gap-4">
        {/* Hamburger menu button - visible only on mobile */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        {/* Landing Page Link */}
        <Link
          to={landingPageLink}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Go to Landing Page"
        >
          <Home size={18} />
          <span className="text-sm font-medium">Go to Home</span>
        </Link>
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
