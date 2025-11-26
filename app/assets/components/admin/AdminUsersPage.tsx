import * as React from "react"
import { AdminLayout } from "./AdminLayout"
import { Table, Pagination } from "@/components/ui/table"
import { Users, Phone, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  phoneNumber: string
  restaurantName: string | null
  createdAt: string
}

interface AdminUsersPageProps {
  users: User[]
  currentPage: number
  totalPages: number
  search: string
  total: number
}

export function AdminUsersPage({
  users,
  currentPage,
  totalPages,
  search,
  total,
}: AdminUsersPageProps) {
  const [searchValue, setSearchValue] = React.useState(search)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(window.location.search)
    params.set('search', searchValue)
    params.set('page', '1')
    window.location.href = `/admin/users?${params.toString()}`
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
      key: 'phoneNumber',
      label: 'Téléphone',
      icon: <Phone className="w-4 h-4" />,
      align: 'left' as const,
    },
    {
      key: 'restaurantName',
      label: 'Restaurant',
      align: 'left' as const,
      render: (value: string | null) => value || <span className="text-gray-400">Non défini</span>,
    },
    {
      key: 'createdAt',
      label: 'Date de création',
      align: 'right' as const,
      render: (value: string) => formatDate(value),
    },
  ]

  return (
    <AdminLayout currentPage="users">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Utilisateurs</h1>
            <p className="text-gray-600 mt-1">{total} utilisateur{total > 1 ? 's' : ''} au total</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par téléphone ou restaurant..."
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
              href="/admin/users"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Réinitialiser
            </a>
          )}
        </form>

        <Table columns={columns} data={users} />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              const params = new URLSearchParams(window.location.search)
              params.set('page', page.toString())
              window.location.href = `/admin/users?${params.toString()}`
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}
