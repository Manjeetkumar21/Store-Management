import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"


export const MainLayout = ({ children, header }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="max-h-screen h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="flex flex-col w-full h-full overflow-hidden">
        <TopBar onMenuClick={toggleSidebar} />

        {/* Page Header (Fixed) */}
        {header && <div className="flex-shrink-0">{header}</div>}

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
