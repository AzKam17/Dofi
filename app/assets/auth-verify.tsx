import React from "react"
import { createRoot } from "react-dom/client"
import { OtpVerifyForm } from "@/components/auth/OtpVerifyForm"
import "./styles/app.css"

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("verify-root")
  if (container) {
    const error = container.dataset.error
    const phoneNumber = container.dataset.phoneNumber || ""
    const expiresIn = parseInt(container.dataset.expiresIn || "600", 10)

    const root = createRoot(container)
    root.render(
      <React.StrictMode>
        <OtpVerifyForm
          error={error}
          phoneNumber={phoneNumber}
          expiresIn={expiresIn}
        />
      </React.StrictMode>
    )
  }
})
