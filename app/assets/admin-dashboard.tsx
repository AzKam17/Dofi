import * as React from "react"
import { createRoot } from "react-dom/client"
import { AdminDashboard } from "@/components/admin/AdminDashboard"
import "./styles/app.css"

const rootElement = document.getElementById("admin-dashboard-root")

if (rootElement) {
  const statsData = rootElement.dataset.stats || "{}"
  const stats = JSON.parse(statsData)

  const root = createRoot(rootElement)
  root.render(<AdminDashboard stats={stats} />)
}
