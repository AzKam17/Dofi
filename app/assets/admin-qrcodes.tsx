import * as React from "react"
import { createRoot } from "react-dom/client"
import { AdminQRCodesPage } from "@/components/admin/AdminQRCodesPage"
import "./styles/app.css"

const rootElement = document.getElementById("admin-qrcodes-root")

if (rootElement) {
  const qrCodesData = rootElement.dataset.qrcodes || "[]"
  const qrCodes = JSON.parse(qrCodesData)
  const restaurantsData = rootElement.dataset.restaurants || "[]"
  const restaurants = JSON.parse(restaurantsData)
  const currentPage = parseInt(rootElement.dataset.currentPage || "1")
  const totalPages = parseInt(rootElement.dataset.totalPages || "1")
  const search = rootElement.dataset.search || ""
  const filter = rootElement.dataset.filter || "all"
  const restaurantFilter = rootElement.dataset.restaurantFilter || ""
  const total = parseInt(rootElement.dataset.total || "0")
  const sortKey = rootElement.dataset.sortKey || "updatedAt"
  const sortDirection = (rootElement.dataset.sortDirection || "desc") as "asc" | "desc"

  const root = createRoot(rootElement)
  root.render(
    <AdminQRCodesPage
      qrCodes={qrCodes}
      restaurants={restaurants}
      currentPage={currentPage}
      totalPages={totalPages}
      search={search}
      filter={filter}
      restaurantFilter={restaurantFilter}
      total={total}
      sortKey={sortKey}
      sortDirection={sortDirection}
    />
  )
}
