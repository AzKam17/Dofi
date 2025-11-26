import * as React from "react"
import { AdminLayout } from "./AdminLayout"
import { Table, Pagination } from "@/components/ui/table"
import { Utensils, Hash, Phone, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Restaurant {
  id: string
  name: string
  slug: string
  userPhone: string | null
  createdAt: string
}

interface AdminRestaurantsPageProps {
  restaurants: Restaurant[]
  currentPage: number
  totalPages: number
  search: string
  total: number
}

export function AdminRestaurantsPage({
  restaurants,
  currentPage,
  totalPages,
  search,
  total,
}: AdminRestaurantsPageProps) {
  const [searchValue, setSearchValue] = React.useState(search)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(window.location.search)
    params.set('search', searchValue)
    params.set('page', '1')
    window.location.href = `/admin/restaurants?${params.toString()}`
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
      key: 'name',
      label: 'Nom',
      icon: <Utensils className="w-4 h-4" />,
      align: 'left' as const,
    },
    {
      key: 'slug',
      label: 'Slug',
      icon: <Hash className="w-4 h-4" />,
      align: 'left' as const,
      render: (value: string) => (
        <a
          href={`/restaurant/${value}`}
          target="_blank"
          className="text-blue-600 hover:underline"
        >
          {value}
        </a>
      ),
    },
    {
      key: 'userPhone',
      label: 'Propriétaire',
      icon: <Phone className="w-4 h-4" />,
      align: 'left' as const,
      render: (value: string | null) => value || <span className="text-gray-400">Aucun</span>,
    },
    {
      key: 'createdAt',
      label: 'Date de création',
      align: 'right' as const,
      render: (value: string) => formatDate(value),
    },
  ]

  return (
    <AdminLayout currentPage="restaurants">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Restaurants</h1>
            <p className="text-gray-600 mt-1">{total} restaurant{total > 1 ? 's' : ''} au total</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, slug ou téléphone..."
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
              href="/admin/restaurants"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Réinitialiser
            </a>
          )}
        </form>

        <Table columns={columns} data={restaurants} />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              const params = new URLSearchParams(window.location.search)
              params.set('page', page.toString())
              window.location.href = `/admin/restaurants?${params.toString()}`
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}
