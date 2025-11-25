import * as React from "react"
import { MenuViewer } from "./MenuViewer"

interface MenuData {
  id: string
  name: string
  type: "pdf" | "image"
  filePath: string
}

interface RestaurantPublicPageProps {
  restaurantName: string
  menus: MenuData[]
}

export function RestaurantPublicPage({ restaurantName, menus }: RestaurantPublicPageProps) {
  const [activeMenuIndex, setActiveMenuIndex] = React.useState(0)
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 })

  React.useEffect(() => {
    const activeTab = tabRefs.current[activeMenuIndex]
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      })
    }
  }, [activeMenuIndex])

  if (menus.length === 0) {
    return (
      <div className="min-h-screen bg-white font-sans">
        {/* Header with background and logo placeholder */}
        <header className="bg-white">
          <div className="relative h-32 bg-gray-200 w-full">
            {/* Background image placeholder */}
            <div className="absolute inset-0 flex items-center">
              <div className="ml-6">
                {/* Logo placeholder - square, vertically centered */}
                <div className="w-20 h-20 bg-gray-400 rounded-lg"></div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-black">{restaurantName}</h1>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-gray-600 text-center">
            Aucun menu disponible pour le moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header with background and logo placeholder */}
      <div className="relative h-32 bg-gray-200 w-full">
        {/* Background image placeholder */}
        <div className="absolute inset-0 flex items-center">
          <div className="ml-6">
            {/* Logo placeholder - square, vertically centered */}
            <div className="w-20 h-20 bg-gray-400 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Restaurant name - scrollable */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-black">{restaurantName}</h1>
        </div>
      </div>

      {/* Tab Menu - sticky */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative">
            <div className="flex overflow-x-auto">
              {menus.map((menu, index) => (
                <button
                  key={menu.id}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  onClick={() => setActiveMenuIndex(index)}
                  className="px-6 py-3 text-base font-medium whitespace-nowrap transition-colors text-black"
                >
                  {menu.name}
                </button>
              ))}
            </div>
            {/* Thin transparent black bar underneath entire tab bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black opacity-20"></div>
            {/* Active tab indicator - darker bar */}
            <div
              className="absolute bottom-0 h-0.5 bg-black transition-all duration-300 ease-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <main>
        {menus[activeMenuIndex] && (
          <MenuViewer
            type={menus[activeMenuIndex].type}
            filePath={menus[activeMenuIndex].filePath}
            name={menus[activeMenuIndex].name}
          />
        )}
      </main>
    </div>
  )
}
