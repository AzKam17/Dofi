import * as React from "react"
import { Document, Page, pdfjs } from "react-pdf"

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  filePath: string
  name: string
}

export function PdfViewer({ filePath, name }: PdfViewerProps) {
  const [numPages, setNumPages] = React.useState<number>(0)
  const [pageNumber, setPageNumber] = React.useState(1)
  const [containerWidth, setContainerWidth] = React.useState<number>(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset
      return Math.min(Math.max(1, newPage), numPages)
    })
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  return (
    <div ref={containerRef} className="w-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* PDF Navigation */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-4 shadow-sm">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-black text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            Précédent
          </button>
          <div className="text-base font-medium">
            Page {pageNumber} sur {numPages}
          </div>
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-black text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            Suivant
          </button>
        </div>

        {/* PDF Document */}
        <div className="flex justify-center bg-white rounded-lg shadow-sm p-4">
          <Document
            file={`/uploads/${filePath}`}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-12">
                <div className="text-gray-600">Chargement du PDF...</div>
              </div>
            }
            error={
              <div className="flex items-center justify-center p-12">
                <div className="text-red-600">Erreur lors du chargement du PDF</div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={containerWidth ? Math.min(containerWidth - 32, 900) : 900}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  )
}
