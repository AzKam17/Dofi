import * as React from "react"
import { createRoot } from "react-dom/client"
import { NotificationsPage } from "@/components/notifications/NotificationsPage"
import "./styles/app.css"

const rootElement = document.getElementById("notifications-root")

if (rootElement) {
  const notificationsData = rootElement.dataset.notifications || "[]"
  const notifications = JSON.parse(notificationsData)

  const root = createRoot(rootElement)
  root.render(<NotificationsPage notifications={notifications} />)
}
