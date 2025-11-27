import { Navigate } from "react-router-dom"
import { useAppSelector } from "@/redux/hooks"


export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token } = useAppSelector((state) => state.auth)

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
