import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Phone, Send } from "lucide-react"

interface LoginFormProps {
  error?: string
  phoneNumber?: string
}

export function LoginForm({ error, phoneNumber }: LoginFormProps) {
  const [phone, setPhone] = React.useState(phoneNumber || "")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="space-y-3 text-center border-b-2 border-black">
          <div className="mx-auto w-16 h-16 bg-black flex items-center justify-center">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-black">
            Connexion
          </CardTitle>
          <CardDescription className="text-base text-black">
            Entrez votre numéro de téléphone pour recevoir un code OTP via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form method="post" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-4 border-2 border-black bg-white text-black text-sm">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-medium text-black">
                  Numéro de téléphone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="0779136356"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoFocus
                    className="pl-10 h-12 text-lg border-2 border-black"
                  />
                </div>
                <p className="text-xs text-black">
                  Nous vous enverrons un code de vérification à 6 chiffres
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-black text-white hover:bg-gray-800 border-2 border-black"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Envoyer le code OTP
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
