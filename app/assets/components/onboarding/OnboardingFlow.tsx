import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Store, CheckCircle2, ArrowRight } from "lucide-react"

interface OnboardingFlowProps {
  currentStep: number
  firstName?: string
}

export function OnboardingFlow({ currentStep, firstName }: OnboardingFlowProps) {
  const [step, setStep] = React.useState(currentStep)
  const [formData, setFormData] = React.useState({
    firstName: firstName || "",
    restaurantName: ""
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleStep1Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/onboarding/step-1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName
        })
      })

      const data = await response.json()

      if (data.success) {
        setStep(2)
      } else {
        setError(data.message || "Une erreur est survenue")
      }
    } catch (err) {
      setError("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep2Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/onboarding/step-2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_name: formData.restaurantName
        })
      })

      const data = await response.json()

      if (data.success && data.redirect) {
        window.location.href = data.redirect
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
    <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex justify-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-black flex items-center justify-center rounded-lg mb-4">
              {step === 1 ? (
                <User className="w-8 h-8 text-white" />
              ) : (
                <Store className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-black">
              {step === 1 ? "Informations personnelles" : "Votre restaurant"}
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              {step === 1
                ? "Commençons par votre prénom"
                : "Quel est le nom de votre restaurant ?"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-black">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Votre prénom"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    autoFocus
                    className="h-12 text-lg border-gray-300 rounded-lg"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-black text-white hover:bg-gray-800 rounded-lg"
                  disabled={isLoading || !formData.firstName}
                >
                  {isLoading ? (
                    "Chargement..."
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName" className="text-sm font-medium text-black">
                    Nom du restaurant
                  </Label>
                  <Input
                    id="restaurantName"
                    type="text"
                    placeholder="Le nom de votre restaurant"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    required
                    autoFocus
                    className="h-12 text-lg border-gray-300 rounded-lg"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-black text-white hover:bg-gray-800 rounded-lg"
                  disabled={isLoading || !formData.restaurantName}
                >
                  {isLoading ? (
                    "Chargement..."
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Terminer
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
