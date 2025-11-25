import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, FileText, Image as ImageIcon, X, Eye, Edit2, ChevronUp, ChevronDown } from "lucide-react"

interface MenuPageProps {
  restaurantId: string
  restaurantSlug: string
}

interface MenuData {
  id: string
  name: string
  type: string
  filePath: string
  createdAt: string
  displayOrder: number
}

interface EditMenuData {
  id: string
  name: string
  file?: File | null
}

export function MenuPage({ restaurantId, restaurantSlug }: MenuPageProps) {
  const [showAddMenu, setShowAddMenu] = React.useState(false)
  const [showEditMenu, setShowEditMenu] = React.useState(false)
  const [editingMenu, setEditingMenu] = React.useState<EditMenuData | null>(null)
  const [menuName, setMenuName] = React.useState("")
  const [menuType, setMenuType] = React.useState<"pdf" | "image" | "custom">("pdf")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [menus, setMenus] = React.useState<MenuData[]>([])
  const [isLoadingMenus, setIsLoadingMenus] = React.useState(true)

  React.useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await fetch("/menu/list")
      const data = await response.json()

      if (data.success) {
        setMenus(data.menus.sort((a: MenuData, b: MenuData) => a.displayOrder - b.displayOrder))
      }
    } catch (err) {
      console.error("Failed to fetch menus", err)
    } finally {
      setIsLoadingMenus(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", menuName)
      formData.append("type", menuType)
      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      const response = await fetch("/menu/create", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setShowAddMenu(false)
        setMenuName("")
        setSelectedFile(null)
        await fetchMenus()
      } else {
        setError(data.message || "Une erreur est survenue")
      }
    } catch (err) {
      setError("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (menu: MenuData) => {
    setEditingMenu({ id: menu.id, name: menu.name, file: null })
    setShowEditMenu(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMenu) return

    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", editingMenu.name)
      if (editingMenu.file) {
        formData.append("file", editingMenu.file)
      }

      const response = await fetch(`/menu/update/${editingMenu.id}`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setShowEditMenu(false)
        setEditingMenu(null)
        await fetchMenus()
      } else {
        setError(data.message || "Une erreur est survenue")
      }
    } catch (err) {
      setError("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const moveMenu = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= menus.length) return

    const newMenus = [...menus]
    const [movedItem] = newMenus.splice(index, 1)
    newMenus.splice(newIndex, 0, movedItem)

    setMenus(newMenus)

    try {
      const orderData = newMenus.map((menu, idx) => ({
        id: menu.id,
        displayOrder: idx,
      }))

      await fetch("/menu/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ menus: orderData }),
      })
    } catch (err) {
      console.error("Failed to update menu order", err)
      await fetchMenus()
    }
  }

  const handlePreview = () => {
    window.open(`/restaurant/${restaurantSlug}`, '_blank')
  }

  return (
    <AppLayout currentPage="menu">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Menus</h1>
            <p className="text-gray-600 mt-1">Gérez vos menus de restaurant</p>
          </div>
          <Button
            onClick={() => setShowAddMenu(true)}
            className="bg-black text-white hover:bg-gray-800 rounded-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un menu
          </Button>
        </div>

        {showAddMenu && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold text-black">
                    Nouveau menu
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Ajoutez un menu sous forme de PDF ou d'image
                  </CardDescription>
                </div>
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="text-gray-600 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="menuName" className="text-sm font-medium text-black">
                    Nom du menu
                  </Label>
                  <Input
                    id="menuName"
                    type="text"
                    placeholder="Ex: Menu du déjeuner"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    required
                    className="h-12 text-base border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black">Type de menu</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMenuType("pdf")}
                      className={`p-4 border rounded-lg flex items-center justify-center gap-3 ${
                        menuType === "pdf"
                          ? "border-black bg-gray-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <FileText className="w-6 h-6" />
                      <span className="font-medium">PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuType("image")}
                      className={`p-4 border rounded-lg flex items-center justify-center gap-3 ${
                        menuType === "image"
                          ? "border-black bg-gray-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <ImageIcon className="w-6 h-6" />
                      <span className="font-medium">Image</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="text-sm font-medium text-black">
                    Fichier
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept={menuType === "pdf" ? ".pdf" : "image/*"}
                    onChange={handleFileChange}
                    required
                    className="h-12 border-gray-300 rounded-lg"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600">
                      Fichier sélectionné: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading || !menuName || !selectedFile}
                    className="flex-1 h-12 text-base font-semibold bg-black text-white hover:bg-gray-800 rounded-lg"
                  >
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddMenu(false)}
                    variant="outline"
                    className="flex-1 h-12 text-base border-gray-300 text-black hover:bg-gray-100 rounded-lg"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {showEditMenu && editingMenu && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold text-black">
                    Modifier le menu
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Modifiez le nom ou remplacez le fichier
                  </CardDescription>
                </div>
                <button
                  onClick={() => {
                    setShowEditMenu(false)
                    setEditingMenu(null)
                    setError("")
                  }}
                  className="text-gray-600 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="editMenuName" className="text-sm font-medium text-black">
                    Nom du menu
                  </Label>
                  <Input
                    id="editMenuName"
                    type="text"
                    placeholder="Ex: Menu du déjeuner"
                    value={editingMenu.name}
                    onChange={(e) => setEditingMenu({ ...editingMenu, name: e.target.value })}
                    required
                    className="h-12 text-base border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editFile" className="text-sm font-medium text-black">
                    Nouveau fichier (optionnel)
                  </Label>
                  <Input
                    id="editFile"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditingMenu({ ...editingMenu, file: e.target.files[0] })
                      }
                    }}
                    className="h-12 border-gray-300 rounded-lg"
                  />
                  {editingMenu.file && (
                    <p className="text-sm text-gray-600">
                      Nouveau fichier: {editingMenu.file.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading || !editingMenu.name}
                    className="flex-1 h-12 text-base font-semibold bg-black text-white hover:bg-gray-800 rounded-lg"
                  >
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowEditMenu(false)
                      setEditingMenu(null)
                      setError("")
                    }}
                    variant="outline"
                    className="flex-1 h-12 text-base border-gray-300 text-black hover:bg-gray-100 rounded-lg"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoadingMenus ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des menus...</p>
          </div>
        ) : menus.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-center">
                Aucun menu pour le moment. Cliquez sur "Ajouter un menu" pour commencer.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Utilisez les flèches pour réorganiser l'ordre d'affichage
            </p>
            <div className="bg-white rounded-lg border border-gray-200">
              {menus.map((menu, index) => (
                <div
                  key={menu.id}
                  className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveMenu(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded ${
                        index === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:text-black hover:bg-gray-200'
                      }`}
                      title="Monter"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveMenu(index, 'down')}
                      disabled={index === menus.length - 1}
                      className={`p-1 rounded ${
                        index === menus.length - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:text-black hover:bg-gray-200'
                      }`}
                      title="Descendre"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-10 h-10 bg-black flex items-center justify-center rounded-lg flex-shrink-0">
                    {menu.type === "pdf" ? (
                      <FileText className="w-5 h-5 text-white" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-black truncate">
                      {menu.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {menu.type}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handlePreview}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-black hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Prévisualiser
                    </Button>
                    <Button
                      onClick={() => handleEdit(menu)}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-black hover:bg-gray-100"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
