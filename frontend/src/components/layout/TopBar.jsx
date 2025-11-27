import { Bell, Settings } from "lucide-react"

export const TopBar = () => {
  return (
    <div className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
      <div />
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
          <Bell size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
          <Settings size={20} />
        </button>
      </div>
    </div>
  )
}
