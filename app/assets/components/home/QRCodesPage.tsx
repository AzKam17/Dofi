import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Calendar, TrendingUp, Copy, Check } from "lucide-react"

interface QRCodeData {
  id: string
  code: string
  tableName: string | null
  scansToday: number
  scansTotal: number
  createdAt: string
}

interface QRCodesPageProps {
  qrCodes: QRCodeData[]
}

export function QRCodesPage({ qrCodes }: QRCodesPageProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  const totalScansToday = qrCodes.reduce((sum, qr) => sum + qr.scansToday, 0)
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scansTotal, 0)

  const copyToClipboard = async (code: string) => {
    const url = `${window.location.origin}/q/${code}`
    await navigator.clipboard.writeText(url)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <AppLayout currentPage="accueil">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-600 mt-1">Gérez vos QR codes et consultez les statistiques de scan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Codes actifs</CardTitle>
              <QrCode className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCodes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scans aujourd'hui</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScansToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scans totaux</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {qrCodes.map((qr) => (
            <Card key={qr.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-black text-white px-3 py-1 rounded font-mono text-sm font-bold">
                        {qr.code}
                      </div>
                      {qr.tableName && (
                        <span className="text-sm text-gray-600">Table: {qr.tableName}</span>
                      )}
                      <button
                        onClick={() => copyToClipboard(qr.code)}
                        className="ml-auto p-2 hover:bg-gray-100 rounded-md transition-colors"
                        title="Copier le lien"
                      >
                        {copiedCode === qr.code ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Scans aujourd'hui</div>
                        <div className="text-2xl font-bold text-gray-900">{qr.scansToday}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Scans totaux</div>
                        <div className="text-2xl font-bold text-gray-900">{qr.scansTotal}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Créé le</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(qr.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      URL: {window.location.origin}/q/{qr.code}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {qrCodes.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <QrCode className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Aucun QR code associé à votre restaurant.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
