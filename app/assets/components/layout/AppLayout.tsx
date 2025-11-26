import * as React from "react"
import { Home, Menu, Settings, Bell, LogOut } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
  currentPage: "accueil" | "menu" | "settings"
}

export function AppLayout({ children, currentPage }: AppLayoutProps) {
  const [unreadCount, setUnreadCount] = React.useState(0)

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/notifications/count")
        const data = await response.json()
        setUnreadCount(data.count)
      } catch (error) {
        console.error("Failed to fetch unread count:", error)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const navigation = [
    { name: "Accueil", href: "/", icon: Home, key: "accueil" },
    { name: "Menu", href: "/menu", icon: Menu, key: "menu" },
    { name: "Paramètres", href: "/settings", icon: Settings, key: "settings" },
  ]

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-300 bg-white">
          <div className="flex items-center justify-between flex-shrink-0 px-6 py-6">
            <h1 className="text-2xl font-bold text-black">Belou</h1>
            <a href="/notifications" className="relative">
              <Bell className="w-6 h-6 text-black hover:text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </a>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = item.key === currentPage
              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base rounded-lg ${
                    isActive
                      ? "bg-black text-white"
                      : "text-black hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              )
            })}
          </nav>
          <div className="p-4 border-t border-gray-300">
            <a
              href="/logout"
              className="flex items-center px-4 py-3 text-base rounded-lg text-black hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile Header with Bell Icon */}
        <div className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">Dofi</h1>
          <a href="/notifications" className="relative">
            <Bell className="w-6 h-6 text-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </a>
        </div>

        <main className="flex-1 pb-20 md:pb-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-300 md:hidden">
        <nav className="flex justify-around">
          {navigation.map((item) => {
            const isActive = item.key === currentPage
            return (
              <a
                key={item.key}
                href={item.href}
                className={`flex flex-col items-center py-3 px-6 flex-1 ${
                  isActive ? "text-black" : "text-gray-600"
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
