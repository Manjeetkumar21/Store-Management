"use client"

import { Link, useLocation } from "react-router-dom"
import { BarChart3, Building2, Store, Package, LogOut, MapPin, ShoppingCart, Wallet, X, Home } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { logout } from "@/redux/slices/authSlice"
import { hideBadge } from "@/redux/slices/cartSlice"
import { cn } from "@/lib/utils"
import { useEffect } from "react"


export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { items, showBadge } = useAppSelector((state) => state.cart)

  useEffect(() => {
    if (showBadge) {
      const timer = setTimeout(() => {
        dispatch(hideBadge())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showBadge, dispatch])

  useEffect(() => {
    if (onClose) {
      onClose()
    }
  }, [location.pathname])

  const adminNavItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <BarChart3 size={20} /> },
    { name: "Companies", href: "/admin/companies", icon: <Building2 size={20} /> },
    { name: "Stores", href: "/admin/stores", icon: <Store size={20} /> },
    { name: "Products", href: "/admin/products", icon: <Package size={20} /> },
    { name: "Orders", href: "/admin/orders", icon: <Building2 size={20} /> },
    { name: "Payments", href: "/admin/payments", icon: <Wallet size={20} /> },
    { name: "Home", href: "/admin", icon: <Home size={20} /> },

  ]

  const storeNavItems = [
    { name: "Dashboard", href: "/store/dashboard", icon: <BarChart3 size={20} /> },
    { name: "Products", href: "/store/products", icon: <Package size={20} /> },
    { name: "Cart", href: "/store/cart", icon: <ShoppingCart size={20} />, badge: items.length },
    { name: "Orders", href: "/store/orders", icon: <Building2 size={20} /> },
    { name: "Addresses", href: "/store/addresses", icon: <MapPin size={20} /> },
    { name: "Home", href: "/store", icon: <Home size={20} /> },

  ]

  const navItems = user?.role === "admin" ? adminNavItems : storeNavItems

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div
      className={cn(
        " left-0 top-0 h-screen w-84 bg-white border-r border-gray-200 flex flex-col shadow-lg z-40 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        aria-label="Close menu"
      >
        <X size={20} className="text-gray-600" />
      </button>

      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">{user?.role === "admin" ? "StoreHub - Admin" : "StoreHub - Store"}</h1>
        <p className="text-xs text-gray-500 mt-1">{user?.role === "admin" ? "Admin Panel" : "Store Panel"}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative cursor-pointer",
              item.name != "Home" && (location.pathname === item.href || location.pathname.startsWith(item.href + "/"))
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            {item.icon}
            <span>{item.name}</span>
            {item.badge > 0 && (
              <span className={cn(
                "ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold rounded-full transition-all",
                showBadge && item.href === "/store/cart"
                  ? "bg-green-500 text-white animate-bounce"
                  : "bg-blue-600 text-white"
              )}>
                {item.badge}
              </span>
            )}
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
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
