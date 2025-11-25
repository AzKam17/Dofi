import * as React from "react"
import { createRoot } from "react-dom/client"
import { RestaurantPublicPage } from "@/components/public/RestaurantPublicPage"
import "./styles/app.css"

const rootElement = document.getElementById("restaurant-public-root")

if (rootElement) {
  const restaurantName = rootElement.dataset.restaurantName || ""
  const restaurantPhoto = rootElement.dataset.restaurantPhoto || null
  const restaurantBackground = rootElement.dataset.restaurantBackground || null
  const menusData = rootElement.dataset.menus || "[]"
  const menus = JSON.parse(menusData)

  const root = createRoot(rootElement)
  root.render(
    <RestaurantPublicPage
      restaurantName={restaurantName}
      restaurantPhoto={restaurantPhoto}
      restaurantBackground={restaurantBackground}
      menus={menus}
    />
  )
}
