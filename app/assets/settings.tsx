import * as React from "react"
import { createRoot } from "react-dom/client"
import { SettingsPage } from "@/components/home/SettingsPage"
import "./styles/app.css"

const rootElement = document.getElementById("settings-root")

if (rootElement) {
  const restaurantDataStr = rootElement.dataset.restaurant || "{}"
  const restaurantData = JSON.parse(restaurantDataStr)

  const root = createRoot(rootElement)
  root.render(<SettingsPage restaurantData={restaurantData} />)
}
