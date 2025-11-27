import * as React from "react"
import { createRoot } from "react-dom/client"
import { RestaurantPublicPage } from "@/components/public/RestaurantPublicPage"
import { trackQRCodeScan } from "@/utils/trackScan"
import "./styles/app.css"

const rootElement = document.getElementById("restaurant-public-root")

if (rootElement) {
  const restaurantName = rootElement.dataset.restaurantName || ""
  const restaurantDescription = rootElement.dataset.restaurantDescription || null
  const restaurantPhoto = rootElement.dataset.restaurantPhoto || null
  const restaurantBackground = rootElement.dataset.restaurantBackground || null
  const menusData = rootElement.dataset.menus || "[]"
  const menus = JSON.parse(menusData)

  // Track QR code scan if coming from QR code
  const urlParams = new URLSearchParams(window.location.search)
  const qrCode = urlParams.get('qr')
  if (qrCode) {
    trackQRCodeScan(qrCode)
  }

  const root = createRoot(rootElement)
  root.render(
    <RestaurantPublicPage
      restaurantName={restaurantName}
      restaurantDescription={restaurantDescription}
      restaurantPhoto={restaurantPhoto}
      restaurantBackground={restaurantBackground}
      menus={menus}
    />
  )
}
