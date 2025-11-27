import * as React from "react"
import { AdminLayout } from "./AdminLayout"
import { Table, Pagination } from "@/components/ui/table"
import { Users, Phone, Search, Plus, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface User {
  id: string
  phoneNumber: string
  name: string
  restaurantName: string | null
  createdAt: string
}

interface Restaurant {
  id: string
  name: string
}

interface AdminUsersPageProps {
  users: User[]
  restaurants: Restaurant[]
  currentPage: number
  totalPages: number
  search: string
  total: number
}

export function AdminUsersPage({
  users,
  restaurants,
  currentPage,
  totalPages,
  search,
  total,
}: AdminUsersPageProps) {
  const [searchValue, setSearchValue] = React.useState(search)
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    isAdmin: false,
    restaurantId: '',
  })

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCreating) return
    setIsCreating(true)

    try {
      const response = await fetch('/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        window.location.reload()
      } else {
        alert(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      alert('Erreur lors de la création')
    } finally {
      setIsCreating(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Nom',
      icon: <Users className="w-4 h-4" />,
      align: 'left' as const,
    },
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
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <UserPlus className="w-4 h-4" />
            Créer un utilisateur
          </button>
        </div>

        {showCreateForm && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-black mb-4">Nouvel utilisateur</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone *
                  </label>
                  <Input
                    type="tel"
                    placeholder="+33612345678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <Input
                    type="text"
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <Input
                    type="text"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant (optionnel)
                  </label>
                  <select
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Aucun restaurant</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">
                  Administrateur
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {isCreating ? 'Création...' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </Card>
        )}

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
