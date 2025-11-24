import * as React from "react"
import { PdfViewer } from "./PdfViewer"

interface MenuViewerProps {
  type: "pdf" | "image"
  filePath: string
  name: string
}

export function MenuViewer({ type, filePath, name }: MenuViewerProps) {
  if (type === "pdf") {
    return <PdfViewer filePath={filePath} name={name} />
  }

  if (type === "image") {
    return (
      <div className="w-full flex justify-center bg-gray-50 p-4">
        <img
          src={`/uploads/${filePath}`}
          alt={name}
          className="max-w-full h-auto rounded-lg"
        />
      </div>
    )
  }

  return null
}
