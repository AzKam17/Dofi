import * as React from "react"

interface MenuViewerProps {
  type: "pdf" | "image"
  filePath: string
  name: string
}

export function MenuViewer({ type, filePath, name }: MenuViewerProps) {
  if (type === "pdf") {
    return (
      <div className="w-full h-screen">
        <iframe
          src={`/uploads/${filePath}`}
          className="w-full h-full border-0"
          title={name}
        />
      </div>
    )
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
