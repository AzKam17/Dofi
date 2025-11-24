import * as React from "react"
import { createRoot } from "react-dom/client"
import { MenuPage } from "@/components/menu/MenuPage"
import "./styles/app.css"

const rootElement = document.getElementById("menu-root")

if (rootElement) {
  const restaurantId = rootElement.dataset.restaurantId || ""

  const root = createRoot(rootElement)
  root.render(<MenuPage restaurantId={restaurantId} />)
}
