import { Navigate } from "react-router-dom"
import { useAppSelector } from "@/redux/hooks"

export const RootRedirect = () => {
    const { user, token } = useAppSelector((state) => state.auth)

    // If user is logged in, redirect to their landing page
    if (user && token) {
        if (user.role === "admin") {
            return <Navigate to="/admin" replace />
        } else if (user.role === "store") {
            return <Navigate to="/store" replace />
        }
    }

    // If not logged in, redirect to login
    return <Navigate to="/login" replace />
}
