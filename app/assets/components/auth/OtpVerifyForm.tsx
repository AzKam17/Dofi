import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft, CheckCircle2 } from "lucide-react"

interface OtpVerifyFormProps {
  error?: string
  phoneNumber: string
  expiresIn: number
}

export function OtpVerifyForm({ error, phoneNumber, expiresIn }: OtpVerifyFormProps) {
  const [otp, setOtp] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(expiresIn)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-black flex items-center justify-center rounded-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-black">
            Vérification OTP
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Nous avons envoyé un code à 6 chiffres au
            <div className="font-semibold text-black mt-1">{phoneNumber}</div>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form method="post" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 text-sm">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp_code" className="text-sm font-medium text-black">
                  Code de vérification
                </Label>
                <Input
                  id="otp_code"
                  name="otp_code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  required
                  autoFocus
                  className="text-center text-3xl font-bold tracking-[0.5em] h-16 border-gray-300 rounded-lg"
                  style={{ letterSpacing: "0.5em" }}
                />
                <div className="flex items-center justify-center gap-2 text-sm">
                  {timeLeft > 0 ? (
                    <p className="text-gray-600">
                      Le code expire dans{" "}
                      <span className="font-semibold text-black">
                        {minutes}:{seconds.toString().padStart(2, "0")}
                      </span>
                    </p>
                  ) : (
                    <p className="text-red-600 font-semibold">Code expiré</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-black text-white hover:bg-gray-800 rounded-lg"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Vérifier et se connecter
                    </>
                  )}
                </Button>

                <a href="/login" className="block">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base border-gray-300 text-black hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Retour à la connexion
                  </Button>
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
