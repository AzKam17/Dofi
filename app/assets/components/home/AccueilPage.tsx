import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Store } from "lucide-react"

interface AccueilPageProps {
  userName: string
  restaurantName: string
}

export function AccueilPage({ userName, restaurantName }: AccueilPageProps) {
  return (
    <AppLayout currentPage="accueil">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-2">
          Bonjour, {userName}
        </h1>
        <p className="text-gray-600 mb-8">
          Bienvenue sur votre espace de gestion
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a href="/qr-codes" className="block transition-transform hover:scale-105">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black flex items-center justify-center rounded-lg">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-black">
                    Restaurant
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-black">{restaurantName}</p>
                <p className="text-sm text-gray-600 mt-2">Cliquez pour voir vos QR codes</p>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>
    </AppLayout>
  )
}
