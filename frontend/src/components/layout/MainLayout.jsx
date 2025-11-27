import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"


export const MainLayout = ({ children }) => {
  return (
    <div className="max-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      <main className="ml-64 mt-16 p-8">{children}</main>
    </div>
  )
}
