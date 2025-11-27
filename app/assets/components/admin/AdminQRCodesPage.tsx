import * as React from "react"
import { AdminLayout } from "./AdminLayout"
import { Table, Pagination } from "@/components/ui/table"
import { QrCode, Search, Plus, Link as LinkIcon, Unlink, ExternalLink, Eye, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface QRCodeItem {
  id: string
  code: string
  tableName: string | null
  restaurantId: string | null
  restaurantName: string | null
  url: string
  lastScannedAt: string | null
  totalScans: number
  scansToday: number
  createdAt: string
  updatedAt: string | null
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
  restaurantFilter: string
  total: number
  sortKey: string
  sortDirection: "asc" | "desc"
}

export function AdminQRCodesPage({
  qrCodes,
  restaurants,
  currentPage,
  totalPages,
  search,
  filter,
  restaurantFilter,
  total,
  sortKey,
  sortDirection,
}: AdminQRCodesPageProps) {
  const [searchValue, setSearchValue] = React.useState(search)
  const [filterValue, setFilterValue] = React.useState(filter)
  const [restaurantFilterValue, setRestaurantFilterValue] = React.useState(restaurantFilter)
  const [generatingCount, setGeneratingCount] = React.useState(10)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [assigningQRCode, setAssigningQRCode] = React.useState<string | null>(null)
  const [customCode, setCustomCode] = React.useState('')
  const [isCreatingCustom, setIsCreatingCustom] = React.useState(false)

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

  const handleSort = (key: string) => {
    const params = new URLSearchParams(window.location.search)
    const newDirection = sortKey === key && sortDirection === 'desc' ? 'asc' : 'desc'
    params.set('sort', key)
    params.set('direction', newDirection)
    params.set('page', '1')
    window.location.href = `/admin/qrcodes?${params.toString()}`
  }

  const handleRestaurantFilterChange = (restaurantId: string) => {
    setRestaurantFilterValue(restaurantId)
    const params = new URLSearchParams(window.location.search)
    if (restaurantId) {
      params.set('restaurant', restaurantId)
    } else {
      params.delete('restaurant')
    }
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

  const handleCreateCustom = async () => {
    if (isCreatingCustom || !customCode.trim()) return
    setIsCreatingCustom(true)

    try {
      const response = await fetch("/admin/qrcodes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: customCode.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        window.location.reload()
      } else {
        alert(data.error || "Erreur lors de la création")
      }
    } catch (error) {
      alert("Erreur lors de la création")
    } finally {
      setIsCreatingCustom(false)
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return <span className="text-gray-400">-</span>
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const columns = [
    {
      key: 'code',
      label: 'Code',
      icon: <QrCode className="w-4 h-4" />,
      align: 'left' as const,
      sortable: true,
      render: (value: string, row: QRCodeItem) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold bg-black text-white px-2 py-1 rounded">
            {value}
          </span>
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
            title="Visiter le code"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ),
    },
    {
      key: 'restaurantName',
      label: 'Restaurant',
      align: 'left' as const,
      render: (value: string | null) => value || <span className="text-gray-400">Non assigné</span>,
    },
    {
      key: 'tableName',
      label: 'Table',
      align: 'left' as const,
      render: (value: string | null) => value || <span className="text-gray-400">-</span>,
    },
    {
      key: 'totalScans',
      label: 'Scans total',
      icon: <Eye className="w-4 h-4" />,
      align: 'right' as const,
      sortable: true,
      render: (value: number) => <span className="font-mono">{value}</span>,
    },
    {
      key: 'scansToday',
      label: "Scans aujourd'hui",
      icon: <Calendar className="w-4 h-4" />,
      align: 'right' as const,
      sortable: true,
      render: (value: number) => <span className="font-mono">{value}</span>,
    },
    {
      key: 'lastScannedAt',
      label: 'Dernier scan',
      align: 'right' as const,
      sortable: true,
      render: (value: string | null) => formatDateTime(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'left' as const,
      render: (_value: any, row: QRCodeItem) => {
        if (row.restaurantName) {
          return (
            <button
              onClick={() => handleUnassign(row.id)}
              className="text-red-600 hover:text-red-800 flex items-center gap-1"
              title="Désassigner"
            >
              <Unlink className="w-4 h-4" />
              Désassigner
            </button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Générer aléatoirement:</span>
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

          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Créer avec un code:</span>
              </div>
              <Input
                type="text"
                placeholder="moncode"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toLowerCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCustom()}
                className="flex-1"
                maxLength={10}
              />
              <button
                onClick={handleCreateCustom}
                disabled={isCreatingCustom || !customCode.trim()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isCreatingCustom ? "Création..." : "Créer"}
              </button>
            </div>
          </Card>
        </div>

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

          <div className="flex gap-2 items-center">
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
            <select
              value={restaurantFilterValue}
              onChange={(e) => handleRestaurantFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <option value="">Tous les restaurants</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={qrCodes}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

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
