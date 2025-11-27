import * as React from "react"
import { AdminLayout } from "./AdminLayout"
import { Table, Pagination } from "@/components/ui/table"
import { Utensils, Hash, Phone, Search, Plus, Image, ImagePlus, Menu as MenuIcon, Edit, Trash2, GripVertical, Upload, X, FileText, ImageIcon, Eye, QrCode } from "lucide-react"
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

interface ScanItem {
  id: string
  scannedAt: string
  fingerprint: string | null
  metadata: Record<string, any> | null
  qrCode: {
    code: string
    tableName: string | null
  }
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
  const [showEditRestaurant, setShowEditRestaurant] = React.useState(false)
  const [restaurantFormData, setRestaurantFormData] = React.useState({
    name: '',
    description: '',
  })
  const [restaurantLogoFile, setRestaurantLogoFile] = React.useState<File | null>(null)
  const [restaurantBackgroundFile, setRestaurantBackgroundFile] = React.useState<File | null>(null)
  const [savingRestaurant, setSavingRestaurant] = React.useState(false)
  const [currentRestaurantData, setCurrentRestaurantData] = React.useState<{
    photoPath: string | null
    backgroundPhotoPath: string | null
  }>({ photoPath: null, backgroundPhotoPath: null })
  const [viewingScansFor, setViewingScansFor] = React.useState<string | null>(null)
  const [scans, setScans] = React.useState<ScanItem[]>([])
  const [loadingScans, setLoadingScans] = React.useState(false)
  const [scansPage, setScansPage] = React.useState(1)
  const [scansTotalPages, setScansTotalPages] = React.useState(1)
  const [scansTotal, setScansTotal] = React.useState(0)

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

  const loadRestaurantData = async (restaurantId: string) => {
    try {
      const response = await fetch(`/admin/restaurants/${restaurantId}`)
      const data = await response.json()
      if (data.success) {
        setRestaurantFormData({
          name: data.restaurant.name || '',
          description: data.restaurant.description || '',
        })
        setCurrentRestaurantData({
          photoPath: data.restaurant.photoPath,
          backgroundPhotoPath: data.restaurant.backgroundPhotoPath,
        })
      }
    } catch (error) {
      alert('Erreur lors du chargement du restaurant')
    }
  }

  const handleManageMenus = async (restaurantId: string) => {
    setManagingMenusFor(restaurantId)
    await Promise.all([loadMenus(restaurantId), loadRestaurantData(restaurantId)])
  }

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (savingRestaurant || !managingMenusFor) return
    setSavingRestaurant(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', restaurantFormData.name)
      formDataToSend.append('description', restaurantFormData.description)
      if (restaurantLogoFile) {
        formDataToSend.append('logo', restaurantLogoFile)
      }
      if (restaurantBackgroundFile) {
        formDataToSend.append('background', restaurantBackgroundFile)
      }

      const response = await fetch(`/admin/restaurants/${managingMenusFor}`, {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (data.success) {
        await loadRestaurantData(managingMenusFor)
        setShowEditRestaurant(false)
        setRestaurantLogoFile(null)
        setRestaurantBackgroundFile(null)
        alert('Restaurant mis à jour avec succès')
      } else {
        alert(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSavingRestaurant(false)
    }
  }

  const loadScans = async (restaurantId: string, page: number = 1) => {
    setLoadingScans(true)
    try {
      const response = await fetch(`/admin/restaurants/${restaurantId}/scans?page=${page}`)
      const data = await response.json()
      if (data.success) {
        setScans(data.scans)
        setScansPage(data.page)
        setScansTotalPages(data.totalPages)
        setScansTotal(data.total)
      }
    } catch (error) {
      alert('Erreur lors du chargement des scans')
    } finally {
      setLoadingScans(false)
    }
  }

  const handleViewScans = async (restaurantId: string) => {
    setViewingScansFor(restaurantId)
    await loadScans(restaurantId, 1)
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleManageMenus(row.id)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <MenuIcon className="w-4 h-4" />
            Gérer les menus
          </button>
          <button
            onClick={() => handleViewScans(row.id)}
            className="text-green-600 hover:text-green-800 flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Voir les scans
          </button>
        </div>
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
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold">Informations du restaurant</h4>
                    <button
                      onClick={() => setShowEditRestaurant(!showEditRestaurant)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      {showEditRestaurant ? 'Annuler' : 'Modifier'}
                    </button>
                  </div>

                  {showEditRestaurant ? (
                    <form onSubmit={handleSaveRestaurant} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom du restaurant *
                          </label>
                          <Input
                            type="text"
                            value={restaurantFormData.name}
                            onChange={(e) => setRestaurantFormData({ ...restaurantFormData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <Input
                            type="text"
                            value={restaurantFormData.description}
                            onChange={(e) => setRestaurantFormData({ ...restaurantFormData, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <Image className="w-4 h-4" />
                              Logo
                            </div>
                          </label>
                          {currentRestaurantData.photoPath && !restaurantLogoFile && (
                            <div className="mb-2">
                              <img
                                src={`/uploads/${currentRestaurantData.photoPath}`}
                                alt="Logo actuel"
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              />
                              <p className="text-xs text-gray-500 mt-1">Logo actuel</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setRestaurantLogoFile(e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          {restaurantLogoFile && (
                            <p className="text-sm text-gray-600 mt-1">{restaurantLogoFile.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <ImagePlus className="w-4 h-4" />
                              Photo de fond
                            </div>
                          </label>
                          {currentRestaurantData.backgroundPhotoPath && !restaurantBackgroundFile && (
                            <div className="mb-2">
                              <img
                                src={`/uploads/${currentRestaurantData.backgroundPhotoPath}`}
                                alt="Fond actuel"
                                className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                              />
                              <p className="text-xs text-gray-500 mt-1">Fond actuel</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setRestaurantBackgroundFile(e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          {restaurantBackgroundFile && (
                            <p className="text-sm text-gray-600 mt-1">{restaurantBackgroundFile.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={savingRestaurant}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                          {savingRestaurant ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditRestaurant(false)
                            setRestaurantLogoFile(null)
                            setRestaurantBackgroundFile(null)
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Nom: </span>
                        <span className="text-sm text-gray-900">{restaurantFormData.name}</span>
                      </div>
                      {restaurantFormData.description && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Description: </span>
                          <span className="text-sm text-gray-900">{restaurantFormData.description}</span>
                        </div>
                      )}
                      <div className="flex gap-4 mt-3">
                        {currentRestaurantData.photoPath && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Logo</p>
                            <img
                              src={`/uploads/${currentRestaurantData.photoPath}`}
                              alt="Logo"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        {currentRestaurantData.backgroundPhotoPath && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Photo de fond</p>
                            <img
                              src={`/uploads/${currentRestaurantData.backgroundPhotoPath}`}
                              alt="Fond"
                              className="w-24 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="text-lg font-bold mb-3">Menus</h4>
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

      {viewingScansFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Historique des scans</h3>
                <p className="text-sm text-gray-600 mt-1">{scansTotal} scan{scansTotal > 1 ? 's' : ''} au total</p>
              </div>
              <button
                onClick={() => setViewingScansFor(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingScans ? (
              <p className="text-gray-600">Chargement...</p>
            ) : scans.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Aucun scan pour ce restaurant</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Code QR</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Table</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date et heure</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Empreinte</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Métadonnées</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.map((scan) => (
                        <tr key={scan.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <QrCode className="w-4 h-4 text-gray-500" />
                              <span className="font-mono font-medium">{scan.qrCode.code}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {scan.qrCode.tableName || <span className="text-gray-400 italic">Non définie</span>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div>{new Date(scan.scannedAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}</div>
                              <div className="text-gray-500">{new Date(scan.scannedAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {scan.fingerprint ? (
                              <span className="font-mono text-xs text-gray-600" title={scan.fingerprint}>
                                {scan.fingerprint.substring(0, 8)}...{scan.fingerprint.substring(56)}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-sm">Non disponible</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {scan.metadata && Object.keys(scan.metadata).length > 0 ? (
                              <details className="cursor-pointer">
                                <summary className="text-blue-600 hover:text-blue-800 text-sm">
                                  Voir les détails ({Object.keys(scan.metadata).length} champ{Object.keys(scan.metadata).length > 1 ? 's' : ''})
                                </summary>
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs">
                                  {Object.entries(scan.metadata).map(([key, value]) => (
                                    <div key={key} className="py-1 flex gap-2">
                                      <span className="font-medium text-gray-700">{key}:</span>
                                      <span className="text-gray-600">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            ) : (
                              <span className="text-gray-400 italic text-sm">Aucune métadonnée</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {scansTotalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={scansPage}
                      totalPages={scansTotalPages}
                      onPageChange={(page) => {
                        if (viewingScansFor) {
                          loadScans(viewingScansFor, page)
                        }
                      }}
                    />
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
