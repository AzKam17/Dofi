import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

interface SettingsPageProps {
  restaurantData: {
    name: string
    description: string | null
    photoPath: string | null
    backgroundPhotoPath: string | null
  }
}

export function SettingsPage({ restaurantData }: SettingsPageProps) {
  const [formData, setFormData] = React.useState({
    name: restaurantData.name,
    description: restaurantData.description || "",
  })
  const [photoFile, setPhotoFile] = React.useState<File | null>(null)
  const [backgroundFile, setBackgroundFile] = React.useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(
    restaurantData.photoPath ? `/uploads/${restaurantData.photoPath}` : null
  )
  const [backgroundPreview, setBackgroundPreview] = React.useState<string | null>(
    restaurantData.backgroundPhotoPath ? `/uploads/${restaurantData.backgroundPhotoPath}` : null
  )
  const [isSaving, setIsSaving] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBackgroundFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const formDataToSend = new FormData()
    formDataToSend.append("name", formData.name)
    formDataToSend.append("description", formData.description)

    if (photoFile) {
      formDataToSend.append("photo", photoFile)
    }

    if (backgroundFile) {
      formDataToSend.append("background", backgroundFile)
    }

    try {
      const response = await fetch("/settings/update", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "Paramètres enregistrés avec succès" })
        setPhotoFile(null)
        setBackgroundFile(null)
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de l'enregistrement" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'enregistrement" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout currentPage="settings">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-2">Paramètres du restaurant</h1>
        <p className="text-gray-600 mb-8">Gérez les informations de votre restaurant</p>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du restaurant</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez votre restaurant..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Logo du restaurant</Label>
                <div className="flex items-start gap-4">
                  {photoPreview && (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={photoPreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Image carrée recommandée (ex: 400x400px)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image de fond</Label>
                <div className="flex items-start gap-4">
                  {backgroundPreview && (
                    <div className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={backgroundPreview}
                        alt="Fond"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Image large recommandée (ex: 1200x400px)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="bg-black text-white hover:bg-gray-800">
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
