import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string | null
  isRead: boolean
  createdAt: string
  metadata: Record<string, any> | null
}

interface NotificationsPageProps {
  notifications: Notification[]
}

export function NotificationsPage({ notifications }: NotificationsPageProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "à l'instant"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `il y a ${days} jour${days > 1 ? 's' : ''}`
    }
  }

  return (
    <AppLayout currentPage="accueil">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-black" />
          <h1 className="text-3xl font-bold text-black">Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Aucune notification</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className={notification.isRead ? "bg-white" : "bg-blue-50"}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {notification.isRead ? (
                        <CheckCircle className="w-5 h-5 text-gray-400" />
                      ) : (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-black">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      {notification.message && (
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
