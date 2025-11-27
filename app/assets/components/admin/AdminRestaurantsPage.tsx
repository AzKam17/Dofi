import * as React from "react"
import { AdminLayout } from "./AdminLayout"
import { Table, Pagination } from "@/components/ui/table"
import { Utensils, Hash, Phone, Search, Plus, Image, ImagePlus, Menu as MenuIcon, Edit, Trash2, GripVertical, Upload, X, FileText, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Restaurant {
  id: string
  name: string
  slug: string
  userPhone: string | null
  createdAt: string
}

interface MenuItem {
  id: string
  name: string
  type: 'pdf' | 'image'
  filePath: string
  displayOrder: number
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
  const [managingMenusFor, setManagingMenusFor] = React.useState<string | null>(null)
  const [menus, setMenus] = React.useState<MenuItem[]>([])
  const [loadingMenus, setLoadingMenus] = React.useState(false)
  const [showAddMenu, setShowAddMenu] = React.useState(false)
  const [editingMenu, setEditingMenu] = React.useState<string | null>(null)
  const [menuFormData, setMenuFormData] = React.useState({
    name: '',
    type: 'pdf' as 'pdf' | 'image',
  })
  const [menuFile, setMenuFile] = React.useState<File | null>(null)
  const [savingMenu, setSavingMenu] = React.useState(false)
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)

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

  const loadMenus = async (restaurantId: string) => {
    setLoadingMenus(true)
    try {
      const response = await fetch(`/admin/restaurants/${restaurantId}/menus`)
      const data = await response.json()
      if (data.success) {
        setMenus(data.menus)
      }
    } catch (error) {
      alert('Erreur lors du chargement des menus')
    } finally {
      setLoadingMenus(false)
    }
  }

  const handleManageMenus = async (restaurantId: string) => {
    setManagingMenusFor(restaurantId)
    await loadMenus(restaurantId)
  }

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (savingMenu || !managingMenusFor) return
    setSavingMenu(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', menuFormData.name)
      formDataToSend.append('type', menuFormData.type)
      if (menuFile) {
        formDataToSend.append('file', menuFile)
      }

      const url = editingMenu
        ? `/admin/restaurants/${managingMenusFor}/menus/${editingMenu}`
        : `/admin/restaurants/${managingMenusFor}/menus/create`

      const response = await fetch(url, {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (data.success) {
        await loadMenus(managingMenusFor)
        setShowAddMenu(false)
        setEditingMenu(null)
        setMenuFormData({ name: '', type: 'pdf' })
        setMenuFile(null)
      } else {
        alert(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSavingMenu(false)
    }
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce menu ?')) return
    if (!managingMenusFor) return

    try {
      const response = await fetch(`/admin/restaurants/${managingMenusFor}/menus/${menuId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await loadMenus(managingMenusFor)
      } else {
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleEditMenu = (menu: MenuItem) => {
    setEditingMenu(menu.id)
    setMenuFormData({
      name: menu.name,
      type: menu.type,
    })
    setShowAddMenu(true)
    setMenuFile(null)
  }

  const handleReorderMenus = async (newOrder: MenuItem[]) => {
    if (!managingMenusFor) return

    try {
      const response = await fetch(`/admin/restaurants/${managingMenusFor}/menus/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: newOrder.map(m => m.id),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMenus(newOrder)
      } else {
        alert(data.error || 'Erreur lors de la réorganisation')
      }
    } catch (error) {
      alert('Erreur lors de la réorganisation')
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newMenus = [...menus]
    const draggedItem = newMenus[draggedIndex]
    newMenus.splice(draggedIndex, 1)
    newMenus.splice(index, 0, draggedItem)

    const reorderedMenus = newMenus.map((menu, idx) => ({
      ...menu,
      displayOrder: idx,
    }))

    setMenus(reorderedMenus)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex !== null) {
      await handleReorderMenus(menus)
      setDraggedIndex(null)
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
    {
      key: 'actions',
      label: 'Actions',
      align: 'left' as const,
      render: (_value: any, row: Restaurant) => (
        <button
          onClick={() => handleManageMenus(row.id)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <MenuIcon className="w-4 h-4" />
          Gérer les menus
        </button>
      ),
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

      {managingMenusFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Gestion des menus</h3>
              <button
                onClick={() => {
                  setManagingMenusFor(null)
                  setShowAddMenu(false)
                  setEditingMenu(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingMenus ? (
              <p className="text-gray-600">Chargement...</p>
            ) : (
              <>
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setShowAddMenu(true)
                      setEditingMenu(null)
                      setMenuFormData({ name: '', type: 'pdf' })
                      setMenuFile(null)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un menu
                  </button>
                </div>

                {showAddMenu && (
                  <Card className="p-4 mb-4 border border-gray-200">
                    <h4 className="text-lg font-bold mb-3">
                      {editingMenu ? 'Modifier le menu' : 'Nouveau menu'}
                    </h4>
                    <form onSubmit={handleSaveMenu} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom du menu *
                        </label>
                        <Input
                          type="text"
                          placeholder="Menu du soir"
                          value={menuFormData.name}
                          onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type *
                        </label>
                        <select
                          value={menuFormData.type}
                          onChange={(e) => setMenuFormData({ ...menuFormData, type: e.target.value as 'pdf' | 'image' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled={!!editingMenu}
                        >
                          <option value="pdf">PDF</option>
                          <option value="image">Image</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Fichier {editingMenu ? '(optionnel pour modification)' : '*'}
                          </div>
                        </label>
                        <input
                          type="file"
                          accept={menuFormData.type === 'pdf' ? 'application/pdf' : 'image/*'}
                          onChange={(e) => setMenuFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required={!editingMenu}
                        />
                        {menuFile && (
                          <p className="text-sm text-gray-600 mt-1">{menuFile.name}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={savingMenu}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                          {savingMenu ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddMenu(false)
                            setEditingMenu(null)
                            setMenuFormData({ name: '', type: 'pdf' })
                            setMenuFile(null)
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </Card>
                )}

                {menus.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">Aucun menu pour ce restaurant</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-2">
                      Glissez-déposez pour réorganiser l'ordre d'affichage
                    </p>
                    {menus.map((menu, index) => (
                      <div
                        key={menu.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-move"
                      >
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <div className="flex items-center gap-2 flex-1">
                          {menu.type === 'pdf' ? (
                            <FileText className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-600" />
                          )}
                          <div>
                            <p className="font-medium">{menu.name}</p>
                            <p className="text-sm text-gray-500">
                              {menu.type.toUpperCase()} • {formatDate(menu.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/uploads/${menu.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Voir
                          </a>
                          <button
                            onClick={() => handleEditMenu(menu)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenu(menu.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}
