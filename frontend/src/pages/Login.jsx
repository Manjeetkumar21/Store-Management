import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"
import { Mail, Lock, User, Check, Eye, EyeOff, } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { loginSuccess, loginFailure, setLoading } from "@/redux/slices/authSlice"
import axiosInstance from "@/api/axiosInstance"
import { ROUTES } from "@/utils/constants"

// Helper component for the Role Selection Toggle (Enhanced UI/UX)
const RoleToggle = ({ role, setRole, error }) => {
  const roles = ["admin", "store"]
  const activeStyle = "bg-indigo-600 text-white shadow-md hover:bg-indigo-600"
  const baseStyle = "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer hover:bg-indigo-50"
  const inactiveStyle = "bg-gray-100 text-gray-700"

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">Select Role</label>
      <div className={`flex p-1 rounded-2xl border ${error ? 'border-red-500' : 'border-gray-200'} bg-gray-50 shadow-inner`}>
        {roles.map((r) => (
          <div
            key={r}
            onClick={() => setRole(r)}
            className={`${baseStyle} ${role === r ? activeStyle : inactiveStyle} flex items-center justify-center capitalize`}
          >
            <User size={16} className="mr-2" />
            {r}
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
    </div>
  )
}

export const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({ email: "", password: "", role: "admin" }) // Include role here
  const [loading, setLoadingState] = useState(false)
  const [errors, setErrors] = useState({ email: "", password: "", role: "" }) // Include role error
  const [showPassword, setShowPassword] = useState(false) // New state for password visibility

  const MIN_PASSWORD_LENGTH = 6;

  const validateForm = () => {
    const newErrors = { email: "", password: "", role: "" }

    // 1. Email Validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // 2. Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) { // Corrected length check
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }

    // 3. Role Validation
    if (!formData.role) {
      newErrors.role = "Please select a role"
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password && !newErrors.role
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoadingState(true)
    dispatch(setLoading(true))

    try {
      // API call for login
      const response = await axiosInstance.post("/auth/login", formData)
      const { user, token } = response.data.data


      dispatch(loginSuccess({ user, token }))
      toast.success("Login successful!")

      // Redirect based on role
      if (user.role === "admin") {
        navigate(ROUTES.ADMIN_DASHBOARD)
      } else {
        navigate(ROUTES.STORE_DASHBOARD)
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed. Please try again."
      dispatch(loginFailure(message))
      toast.error(message)
    } finally {
      setLoadingState(false)
      dispatch(setLoading(false))
    }
  }

  const PasswordToggleIcon = () => (
    <span
      className="absolute right-3 bottom-3 cursor-pointer text-gray-400 hover:text-indigo-600 transition"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </span>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-md transform transition duration-500 hover:shadow-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-700">🛒 Store Manager</h1>
          <p className="text-gray-500 mt-2">Log in to manage your inventory and operations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Enhanced Role Selection Toggle */}
          <RoleToggle
            role={formData.role}
            setRole={(role) => setFormData({ ...formData, role })}
            error={errors.role}
          />

          {/* Email Input */}
          <Input
            label="Email Address"
            type="email"
            icon={<Mail size={20} className="text-indigo-500" />}
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"} // Dynamic type based on state
              icon={<Lock size={20} className="text-indigo-500" />}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
            />
            <PasswordToggleIcon />
          </div>

          {/* Submit Button - Primary CTA */}
          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 transition duration-150">
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}