"use client"

import { Link, useLocation } from "react-router-dom"
import { BarChart3, Building2, Store, Package, LogOut } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { logout } from "@/redux/slices/authSlice"
import { cn } from "@/lib/utils"


export const Sidebar = () => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const adminNavItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <BarChart3 size={20} /> },
    { name: "Companies", href: "/admin/companies", icon: <Building2 size={20} /> },
    { name: "Stores", href: "/admin/stores", icon: <Store size={20} /> },
    { name: "Products", href: "/admin/products", icon: <Package size={20} /> },
  ]

  const storeNavItems = [
    { name: "Dashboard", href: "/store/dashboard", icon: <BarChart3 size={20} /> },
    { name: "Products", href: "/store/products", icon: <Package size={20} /> },
    { name: "Cart", href: "/store/cart", icon: <Store size={20} /> },
    { name: "Orders", href: "/store/orders", icon: <Building2 size={20} /> },
  ]

  const navItems = user?.role === "admin" ? adminNavItems : storeNavItems

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">StoreHub</h1>
        <p className="text-xs text-gray-500 mt-1">{user?.role === "admin" ? "Admin Panel" : "Store Panel"}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname === item.href
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
