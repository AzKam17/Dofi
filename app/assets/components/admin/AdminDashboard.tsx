import * as React from "react"
import { AdminLayout } from "./AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Utensils, QrCode, CheckCircle, XCircle } from "lucide-react"

interface Stats {
  totalUsers: number
  totalRestaurants: number
  totalQRCodes: number
  assignedQRCodes: number
  unassignedQRCodes: number
}

interface AdminDashboardProps {
  stats: Stats
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Utilisateurs
              </CardTitle>
              <Users className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats.totalUsers}</div>
              <a href="/admin/users" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                Voir tous →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Restaurants
              </CardTitle>
              <Utensils className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats.totalRestaurants}</div>
              <a href="/admin/restaurants" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                Voir tous →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                QR Codes Totaux
              </CardTitle>
              <QrCode className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats.totalQRCodes}</div>
              <a href="/admin/qrcodes" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                Gérer →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                QR Codes Assignés
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.assignedQRCodes}</div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.totalQRCodes > 0
                  ? Math.round((stats.assignedQRCodes / stats.totalQRCodes) * 100)
                  : 0}% du total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                QR Codes Non Assignés
              </CardTitle>
              <XCircle className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{stats.unassignedQRCodes}</div>
              <a href="/admin/qrcodes?filter=unassigned" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                Voir tous →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
