import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"
import { Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { loginSuccess, loginFailure, setLoading } from "@/redux/slices/authSlice"
import axiosInstance from "@/api/axiosInstance"
import { ROUTES } from "@/utils/constants"

export const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoadingState] = useState(false)
  const [errors, setErrors] = useState({ email: "", password: "", role: "" })

  const validateForm = () => {
    const newErrors = { email: "", password: "" }
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 2) newErrors.password = "Password must be at least 6 characters"
    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoadingState(true)
    dispatch(setLoading(true))

    try {
      const response = await axiosInstance.post("/auth/login", formData)
      console.log(response.data)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Manager</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="store">Store</option>
          </select>

          <Input
            label="Email Address"
            type="email"
            icon={<Mail size={20} />}
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            icon={<Lock size={20} />}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
          />

          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full mt-6">
            Sign In
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Demo Credentials:</p>
          <p className="text-xs text-gray-500 mt-1">Admin: admin@test.com / password123</p>
          <p className="text-xs text-gray-500">Store: store@test.com / password123</p>
        </div>
      </div>
    </div>
  )
}
