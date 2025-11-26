import * as React from "react"
import { createRoot } from "react-dom/client"
import { AdminUsersPage } from "@/components/admin/AdminUsersPage"
import "./styles/app.css"

const rootElement = document.getElementById("admin-users-root")

if (rootElement) {
  const usersData = rootElement.dataset.users || "[]"
  const users = JSON.parse(usersData)
  const currentPage = parseInt(rootElement.dataset.currentPage || "1")
  const totalPages = parseInt(rootElement.dataset.totalPages || "1")
  const search = rootElement.dataset.search || ""
  const total = parseInt(rootElement.dataset.total || "0")

  const root = createRoot(rootElement)
  root.render(
    <AdminUsersPage
      users={users}
      currentPage={currentPage}
      totalPages={totalPages}
      search={search}
      total={total}
    />
  )
}
