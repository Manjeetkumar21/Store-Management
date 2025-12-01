import { Link } from "react-router-dom"
import { Store, LayoutDashboard } from "lucide-react"

export const LandingNavbar = ({ role, dashboardLink }) => {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Store className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">StoreHub</h1>
                            <p className="text-xs text-gray-500 hidden sm:block">
                                {role === "admin" ? "Admin Portal" : "Store Management"}
                            </p>
                        </div>
                    </div>

                    {/* Dashboard Link */}
                    <Link
                        to={dashboardLink}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <LayoutDashboard size={18} />
                        <span className="hidden sm:inline">Go to Dashboard</span>
                        <span className="sm:hidden">Dashboard</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
