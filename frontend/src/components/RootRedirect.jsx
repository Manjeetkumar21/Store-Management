import { Navigate } from "react-router-dom"
import { useAppSelector } from "@/redux/hooks"

export const RootRedirect = () => {
    const { user, token } = useAppSelector((state) => state.auth)

    if (user && token) {
        if (user.role === "admin") {
            return <Navigate to="/admin" replace />
        } else if (user.role === "store") {
            return <Navigate to="/store" replace />
        }
    }

    return <Navigate to="/admin" replace />
}
