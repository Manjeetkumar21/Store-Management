import { Link, useNavigate } from "react-router-dom"
import { Store, LayoutDashboard, LogIn, LogOut } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { logout } from "@/redux/slices/authSlice"
import toast from "react-hot-toast"

export const LandingNavbar = ({ role, dashboardLink, logoImage, navbarHeading }) => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user, token } = useAppSelector((state) => state.auth)
    const isAuthenticated = !!(user && token)

    const handleLogout = () => {
        dispatch(logout())
        toast.success("Logged out successfully")
        // Stay on current landing page after logout
    }

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={role === "admin" ? "/admin" : "/store"} className="flex items-center gap-2">
                        {logoImage ? (
                            <img src={logoImage} alt="Logo" className="h-10 w-auto rounded-lg object-cover" />
                        ) : (
                            <img src="tcpl-logo.webp" alt="Logo" className="h-10 w-auto rounded-lg object-cover" />

                        )}
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {navbarHeading || (role === "admin" ? "TCPL Stores" : "Store Portal")}
                            </h1>
                            <p className="text-xs text-gray-500 hidden sm:block">
                                {role === "admin" ? "Admin" : "Store"}
                            </p>
                        </div>
                    </Link>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={dashboardLink}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                >
                                    <LayoutDashboard size={18} />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors font-medium cursor-pointer"
                                >
                                    <LogOut size={18} />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <LogIn size={18} />
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
