"use client"

import useAuthStore from "@/store/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
} from "lucide-react"
import ContentCard from "@/components/layout/ContentCard"
import { cn } from "@/lib/utils"

// Mock data
const mockStats = {
  totalPackages: 24,
  totalReservations: 156,
  upcomingTrips: 8,
  totalRevenue: 245000,
}

const mockRecentBookings = [
  {
    id: 1,
    name: "Marie Dubois",
    package: "Paris Weekend",
    date: "2024-01-15",
    status: "confirmed",
    amount: "€1,250",
  },
  {
    id: 2,
    name: "Jean Martin",
    package: "Rome Adventure",
    date: "2024-01-18",
    status: "pending",
    amount: "€2,100",
  },
  {
    id: 3,
    name: "Sophie Laurent",
    package: "Barcelona Tour",
    date: "2024-01-20",
    status: "confirmed",
    amount: "€1,800",
  },
  {
    id: 4,
    name: "Pierre Moreau",
    package: "London Explorer",
    date: "2024-01-22",
    status: "cancelled",
    amount: "€1,650",
  },
]

const mockTopPackages = [
  { name: "Paris Weekend", bookings: 45, revenue: "€56,250" },
  { name: "Rome Adventure", bookings: 38, revenue: "€79,800" },
  { name: "Barcelona Tour", bookings: 32, revenue: "€57,600" },
  { name: "London Explorer", bookings: 28, revenue: "€46,200" },
]

const mockUpcomingDepartures = [
  { name: "Paris Weekend", date: "2024-01-15", seatsLeft: 3, totalSeats: 25 },
  { name: "Rome Adventure", date: "2024-01-18", seatsLeft: 8, totalSeats: 30 },
  { name: "Barcelona Tour", date: "2024-01-20", seatsLeft: 1, totalSeats: 20 },
  { name: "London Explorer", date: "2024-01-22", seatsLeft: 12, totalSeats: 35 },
]

const mockAlerts = [
  {
    type: "warning" as const,
    message: "Barcelona Tour has only 1 seat left",
    icon: AlertTriangle,
    time: "Il y a 2h",
  },
  {
    type: "info" as const,
    message: "3 bookings pending confirmation",
    icon: Clock,
    time: "Il y a 4h",
  },
  {
    type: "warning" as const,
    message: "Rome Adventure booking deadline in 2 days",
    icon: Calendar,
    time: "Il y a 6h",
  },
]

export default function Dashboard() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#FEAC19] border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  // Add role-specific content at the beginning of the component
  const isAdmin = user?.role === "ADMIN"
  const isSeller = user?.role === "VENDEUR"

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors">
            Confirmé
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 transition-colors">
            En attente
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200 transition-colors">Annulé</Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 transition-colors">
            {status}
          </Badge>
        )
    }
  }

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <ContentCard className="group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">{trend}</span>
              <span className="text-sm text-gray-500">vs mois dernier</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            `bg-gradient-to-br ${color} shadow-lg group-hover:shadow-xl transition-all duration-300`,
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </ContentCard>
  )

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      {/* Update the header section to show role-specific welcome message */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? "Tableau de bord Administrateur" : "Tableau de bord Vendeur"}
        </h1>
        <p className="text-lg text-gray-600">
          Bienvenue, <span className="font-semibold text-gray-800">{user?.fullName}</span>!
          {isAdmin
            ? " Voici un aperçu global de l'activité commerciale."
            : " Voici un aperçu de vos performances de vente."}
        </p>
      </div>

      {/* KPI Cards */}
      {/* Update the stats section to show role-appropriate metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isAdmin ? "Total Forfaits" : "Mes Forfaits"}
          value={mockStats.totalPackages.toString()}
          icon={Package}
          trend="+12%"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title={isAdmin ? "Réservations" : "Mes Réservations"}
          value={mockStats.totalReservations.toString()}
          icon={Users}
          trend="+23%"
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Voyages à venir"
          value={mockStats.upcomingTrips.toString()}
          icon={MapPin}
          trend="+5%"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title={isAdmin ? "Chiffre d'affaires" : "Mes Revenus"}
          value={`€${mockStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="+18%"
          color="from-[#FEAC19] to-orange-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <ContentCard className="space-y-6">
          {/* Update the recent bookings section title */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isAdmin ? "Réservations récentes" : "Mes réservations récentes"}
              </h3>
              <p className="text-sm text-gray-600">
                {isAdmin ? "Dernières activités de réservation" : "Dernières réservations de vos forfaits"}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Eye className="h-4 w-4" />
              Voir tout
            </Button>
          </div>

          <div className="space-y-3">
            {mockRecentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {booking.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.name}</p>
                    <p className="text-sm text-gray-600">{booking.package}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-semibold text-gray-900">{booking.amount}</p>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Top Packages */}
        <ContentCard className="space-y-6">
          {/* Update the top packages section title */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isAdmin ? "Forfaits populaires" : "Mes meilleurs forfaits"}
              </h3>
              <p className="text-sm text-gray-600">
                {isAdmin ? "Performances des meilleurs forfaits" : "Performances de vos forfaits"}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowUpRight className="h-4 w-4" />
              {isAdmin ? "Analytics" : "Mes revenus"}
            </Button>
          </div>

          <div className="space-y-4">
            {mockTopPackages.map((pkg, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#FEAC19]/30 hover:bg-[#FEAC19]/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FEAC19] to-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pkg.name}</p>
                    <p className="text-sm text-gray-600">{pkg.bookings} réservations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{pkg.revenue}</p>
                  <p className="text-sm text-green-600">+15% ce mois</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Departures */}
        <ContentCard className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Départs à venir</h3>
              <p className="text-sm text-gray-600">Disponibilité des places</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              Planning
            </Button>
          </div>

          <div className="space-y-4">
            {mockUpcomingDepartures.map((departure, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{departure.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {departure.date}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      departure.seatsLeft <= 3
                        ? "bg-red-100 text-red-700 border-red-200"
                        : departure.seatsLeft <= 8
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-green-100 text-green-700 border-green-200",
                    )}
                  >
                    {departure.seatsLeft} places restantes
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      departure.seatsLeft <= 3
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : departure.seatsLeft <= 8
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          : "bg-gradient-to-r from-green-500 to-green-600",
                    )}
                    style={{
                      width: `${((departure.totalSeats - departure.seatsLeft) / departure.totalSeats) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {departure.totalSeats - departure.seatsLeft}/{departure.totalSeats} places réservées
                </p>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Alerts & Notifications */}
        <ContentCard className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Alertes & Notifications</h3>
              <p className="text-sm text-gray-600">Informations importantes</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <MoreHorizontal className="h-4 w-4" />
              Options
            </Button>
          </div>

          <div className="space-y-3">
            {mockAlerts.map((alert, index) => {
              const IconComponent = alert.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 hover:shadow-md",
                    alert.type === "warning"
                      ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                      : "bg-blue-50 border-blue-200 hover:bg-blue-100",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg",
                      alert.type === "warning" ? "bg-yellow-200 text-yellow-700" : "bg-blue-200 text-blue-700",
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        alert.type === "warning" ? "text-yellow-800" : "text-blue-800",
                      )}
                    >
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </ContentCard>
      </div>
    </div>
  )
}
