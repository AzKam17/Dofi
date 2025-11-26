import * as React from "react"
import { createRoot } from "react-dom/client"
import { AdminRestaurantsPage } from "@/components/admin/AdminRestaurantsPage"
import "./styles/app.css"

const rootElement = document.getElementById("admin-restaurants-root")

if (rootElement) {
  const restaurantsData = rootElement.dataset.restaurants || "[]"
  const restaurants = JSON.parse(restaurantsData)
  const currentPage = parseInt(rootElement.dataset.currentPage || "1")
  const totalPages = parseInt(rootElement.dataset.totalPages || "1")
  const search = rootElement.dataset.search || ""
  const total = parseInt(rootElement.dataset.total || "0")

  const root = createRoot(rootElement)
  root.render(
    <AdminRestaurantsPage
      restaurants={restaurants}
      currentPage={currentPage}
      totalPages={totalPages}
      search={search}
      total={total}
    />
  )
}
