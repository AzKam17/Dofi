import * as React from "react"
import { createRoot } from "react-dom/client"
import { AccueilPage } from "@/components/home/AccueilPage"
import "./styles/app.css"

const rootElement = document.getElementById("home-root")

if (rootElement) {
  const userName = rootElement.dataset.userName || ""
  const restaurantName = rootElement.dataset.restaurantName || ""

  const root = createRoot(rootElement)
  root.render(<AccueilPage userName={userName} restaurantName={restaurantName} />)
}
