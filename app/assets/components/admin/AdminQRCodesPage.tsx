import * as React from "react"
import { AdminLayout } from "./AdminLayout"
import { Table, Pagination } from "@/components/ui/table"
import { QrCode, Search, Plus, Link as LinkIcon, Unlink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface QRCodeItem {
  id: string
  code: string
  tableName: string | null
  restaurantId: string | null
  restaurantName: string | null
  createdAt: string
}

interface Restaurant {
  id: string
  name: string
}

interface AdminQRCodesPageProps {
  qrCodes: QRCodeItem[]
  restaurants: Restaurant[]
  currentPage: number
  totalPages: number
  search: string
  filter: string
  total: number
}

export function AdminQRCodesPage({
  qrCodes,
  restaurants,
  currentPage,
  totalPages,
  search,
  filter,
  total,
}: AdminQRCodesPageProps) {
  const [searchValue, setSearchValue] = React.useState(search)
  const [filterValue, setFilterValue] = React.useState(filter)
  const [generatingCount, setGeneratingCount] = React.useState(10)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [assigningQRCode, setAssigningQRCode] = React.useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('search', searchValue)
    params.set('filter', filterValue)
    params.set('page', '1')
    window.location.href = `/admin/qrcodes?${params.toString()}`
  }

  const handleFilterChange = (newFilter: string) => {
    setFilterValue(newFilter)
    const params = new URLSearchParams(window.location.search)
    params.set('filter', newFilter)
    params.set('page', '1')
    window.location.href = `/admin/qrcodes?${params.toString()}`
  }

  const handleGenerate = async () => {
    if (isGenerating) return
    setIsGenerating(true)

    try {
      const response = await fetch("/admin/qrcodes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: generatingCount }),
      })

      const data = await response.json()

      if (data.success) {
        window.location.reload()
      } else {
        alert("Erreur lors de la génération")
      }
    } catch (error) {
      alert("Erreur lors de la génération")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAssign = async (qrCodeId: string, restaurantId: string, tableName: string) => {
    try {
      const response = await fetch(`/admin/qrcodes/${qrCodeId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, tableName }),
      })

      const data = await response.json()

      if (data.success) {
        window.location.reload()
      } else {
        alert(data.error || "Erreur lors de l'assignation")
      }
    } catch (error) {
      alert("Erreur lors de l'assignation")
    }
  }

  const handleUnassign = async (qrCodeId: string) => {
    if (!confirm("Voulez-vous vraiment désassigner ce QR code ?")) return

    try {
      const response = await fetch(`/admin/qrcodes/${qrCodeId}/unassign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (data.success) {
        window.location.reload()
      } else {
        alert(data.error || "Erreur lors de la désassignation")
      }
    } catch (error) {
      alert("Erreur lors de la désassignation")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const columns = [
    {
      key: 'code',
      label: 'Code',
      icon: <QrCode className="w-4 h-4" />,
      align: 'left' as const,
      render: (value: string) => (
        <span className="font-mono font-bold bg-black text-white px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'tableName',
      label: 'Table',
      align: 'left' as const,
      render: (value: string | null) => value || <span className="text-gray-400">-</span>,
    },
    {
      key: 'restaurantName',
      label: 'Restaurant',
      align: 'left' as const,
      render: (value: string | null, row: QRCodeItem) => {
        if (value) {
          return (
            <div className="flex items-center gap-2">
              <span>{value}</span>
              <button
                onClick={() => handleUnassign(row.id)}
                className="text-red-600 hover:text-red-800"
                title="Désassigner"
              >
                <Unlink className="w-4 h-4" />
              </button>
            </div>
          )
        }
        return (
          <button
            onClick={() => setAssigningQRCode(row.id)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <LinkIcon className="w-4 h-4" />
            Assigner
          </button>
        )
      },
    },
    {
      key: 'createdAt',
      label: 'Date de création',
      align: 'right' as const,
      render: (value: string) => formatDate(value),
    },
  ]

  return (
    <AdminLayout currentPage="qrcodes">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">QR Codes</h1>
            <p className="text-gray-600 mt-1">{total} QR code{total > 1 ? 's' : ''} au total</p>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Générer des QR codes:</span>
            </div>
            <Input
              type="number"
              min="1"
              max="1000"
              value={generatingCount}
              onChange={(e) => setGeneratingCount(parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {isGenerating ? "Génération..." : "Générer"}
            </button>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par code, table ou restaurant..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Rechercher
            </button>
            {search && (
              <a
                href="/admin/qrcodes"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Réinitialiser
              </a>
            )}
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg ${
                filterValue === 'all'
                  ? 'bg-black text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => handleFilterChange('assigned')}
              className={`px-4 py-2 rounded-lg ${
                filterValue === 'assigned'
                  ? 'bg-black text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Assignés
            </button>
            <button
              onClick={() => handleFilterChange('unassigned')}
              className={`px-4 py-2 rounded-lg ${
                filterValue === 'unassigned'
                  ? 'bg-black text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Non assignés
            </button>
          </div>
        </div>

        <Table columns={columns} data={qrCodes} />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              const params = new URLSearchParams(window.location.search)
              params.set('page', page.toString())
              window.location.href = `/admin/qrcodes?${params.toString()}`
            }}
          />
        )}
      </div>

      {assigningQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Assigner le QR Code</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const restaurantId = formData.get('restaurantId') as string
                const tableName = formData.get('tableName') as string
                handleAssign(assigningQRCode, restaurantId, tableName)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant
                </label>
                <select
                  name="restaurantId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner un restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la table (optionnel)
                </label>
                <Input
                  type="text"
                  name="tableName"
                  placeholder="Table 1"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Assigner
                </button>
                <button
                  type="button"
                  onClick={() => setAssigningQRCode(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}
