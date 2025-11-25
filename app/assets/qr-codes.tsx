import * as React from "react"
import { createRoot } from "react-dom/client"
import { QRCodesPage } from "@/components/home/QRCodesPage"
import "./styles/app.css"

const rootElement = document.getElementById("qr-codes-root")

if (rootElement) {
  const qrCodesData = rootElement.dataset.qrCodes || "[]"
  const qrCodes = JSON.parse(qrCodesData)

  const root = createRoot(rootElement)
  root.render(<QRCodesPage qrCodes={qrCodes} />)
}
