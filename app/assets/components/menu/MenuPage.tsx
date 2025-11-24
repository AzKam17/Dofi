import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, FileText, Image as ImageIcon, X } from "lucide-react"

interface MenuPageProps {
  restaurantId: string
}

export function MenuPage({ restaurantId }: MenuPageProps) {
  const [showAddMenu, setShowAddMenu] = React.useState(false)
  const [menuName, setMenuName] = React.useState("")
  const [menuType, setMenuType] = React.useState<"pdf" | "image" | "custom">("pdf")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

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
        window.location.reload()
      } else {
        setError(data.message || "Une erreur est survenue")
      }
    } catch (err) {
      setError("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-center">
                Aucun menu pour le moment. Cliquez sur "Ajouter un menu" pour commencer.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
