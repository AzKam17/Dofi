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

  if (menus.length === 0) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <header className="border-b border-gray-300 bg-white">
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
      <header className="border-b border-gray-300 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-black mb-4">{restaurantName}</h1>

          {/* Tab Menu */}
          <div className="flex gap-2 overflow-x-auto">
            {menus.map((menu, index) => (
              <button
                key={menu.id}
                onClick={() => setActiveMenuIndex(index)}
                className={`px-6 py-3 text-base font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeMenuIndex === index
                    ? "bg-black text-white"
                    : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                {menu.name}
              </button>
            ))}
          </div>
        </div>
      </header>

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
