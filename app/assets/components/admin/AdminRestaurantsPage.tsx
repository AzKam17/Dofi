import * as React from "react"
import { AdminLayout } from "./AdminLayout"
import { Table, Pagination } from "@/components/ui/table"
import { Utensils, Hash, Phone, Search, Plus, Image, ImagePlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

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
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
  })
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [backgroundFile, setBackgroundFile] = React.useState<File | null>(null)

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

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCreating) return
    setIsCreating(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      if (logoFile) {
        formDataToSend.append('logo', logoFile)
      }
      if (backgroundFile) {
        formDataToSend.append('background', backgroundFile)
      }

      const response = await fetch('/admin/restaurants/create', {
        method: 'POST',
        body: formDataToSend,
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
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Créer un restaurant
          </button>
        </div>

        {showCreateForm && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-black mb-4">Nouveau restaurant</h2>
            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du restaurant *
                  </label>
                  <Input
                    type="text"
                    placeholder="Le Petit Bistro"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <Input
                    type="text"
                    placeholder="Cuisine française traditionnelle"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Logo (optionnel)
                    </div>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {logoFile && (
                    <p className="text-sm text-gray-600 mt-1">{logoFile.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <ImagePlus className="w-4 h-4" />
                      Photo de fond (optionnel)
                    </div>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {backgroundFile && (
                    <p className="text-sm text-gray-600 mt-1">{backgroundFile.name}</p>
                  )}
                </div>
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
