import React from "react"
import { createRoot } from "react-dom/client"
import { LoginForm } from "@/components/auth/LoginForm"
import "./styles/app.css"

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("login-root")
  if (container) {
    const error = container.dataset.error
    const phoneNumber = container.dataset.phoneNumber

    const root = createRoot(container)
    root.render(
      <React.StrictMode>
        <LoginForm error={error} phoneNumber={phoneNumber} />
      </React.StrictMode>
    )
  }
})
