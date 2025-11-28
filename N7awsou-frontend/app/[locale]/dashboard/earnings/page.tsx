"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { axiosPrivate } from "@/api/axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Eye,
  Download,
  BarChart3,
  PieChart,
  ArrowUpRight,
} from "lucide-react"
import ContentCard from "@/components/layout/ContentCard"
import { cn } from "@/lib/utils"
import useAuthStore from "@/store/store"

interface EarningsData {
  totalRevenue: number
  monthlyRevenue: number
  totalBookings: number
  monthlyBookings: number
  averageOrderValue: number
  topPerformingTours: Array<{
    tourId: number
    tourName: string
    revenue: number
    bookings: number
    averageRating: number
  }>
  monthlyBreakdown: Array<{
    month: string
    revenue: number
    bookings: number
  }>
  recentTransactions: Array<{
    id: number
    tourName: string
    customerName: string
    amount: number
    currency: string
    date: string
    status: string
  }>
}

export default function EarningsPage() {
  const { user, accessToken } = useAuthStore()
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  // Fetch earnings data
  const fetchEarningsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch earnings data for this seller
      const response = await axiosPrivate.get(`/payments/seller/${user?.id}/earnings?period=${selectedPeriod}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      setEarningsData(response.data)
    } catch (err: any) {
      console.log("Error fetching earnings data:", err)
      setError(err.response?.data?.message || "Failed to fetch earnings data")

      // Mock data for demonstration
      setEarningsData({
        totalRevenue: 45750.0,
        monthlyRevenue: 12300.0,
        totalBookings: 156,
        monthlyBookings: 42,
        averageOrderValue: 293.27,
        topPerformingTours: [
          {
            tourId: 1,
            tourName: "Paris Weekend Getaway",
            revenue: 15600.0,
            bookings: 24,
            averageRating: 4.8,
          },
          {
            tourId: 2,
            tourName: "Mediterranean Coast Tour",
            revenue: 12400.0,
            bookings: 18,
            averageRating: 4.6,
          },
          {
            tourId: 3,
            tourName: "Sahara Desert Adventure",
            revenue: 9800.0,
            bookings: 15,
            averageRating: 4.9,
          },
        ],
        monthlyBreakdown: [
          { month: "Jan", revenue: 8500, bookings: 28 },
          { month: "Fév", revenue: 9200, bookings: 31 },
          { month: "Mar", revenue: 11800, bookings: 38 },
          { month: "Avr", revenue: 10400, bookings: 35 },
          { month: "Mai", revenue: 12300, bookings: 42 },
        ],
        recentTransactions: [
          {
            id: 1,
            tourName: "Paris Weekend Getaway",
            customerName: "Marie Dubois",
            amount: 650.0,
            currency: "EUR",
            date: "2024-01-15T10:30:00Z",
            status: "COMPLETED",
          },
          {
            id: 2,
            tourName: "Mediterranean Coast Tour",
            customerName: "Jean Martin",
            amount: 890.0,
            currency: "EUR",
            date: "2024-01-14T14:20:00Z",
            status: "COMPLETED",
          },
          {
            id: 3,
            tourName: "Sahara Desert Adventure",
            customerName: "Sophie Laurent",
            amount: 1200.0,
            currency: "EUR",
            date: "2024-01-13T09:15:00Z",
            status: "PROCESSING",
          },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === "VENDEUR") {
      fetchEarningsData()
    }
  }, [user, accessToken, selectedPeriod])

  // Redirect if not a seller
  if (user && user.role !== "VENDEUR") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900">Accès refusé</h2>
          <p className="text-gray-600">Cette page est réservée aux vendeurs.</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEAC19] mx-auto"></div>
          <p className="text-gray-600">Chargement des revenus...</p>
        </div>
      </div>
    )
  }

  if (!earningsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-gray-400 text-6xl">📊</div>
          <h2 className="text-xl font-semibold text-gray-900">Aucune donnée disponible</h2>
          <p className="text-gray-600">Les données de revenus apparaîtront ici une fois que vous aurez des ventes.</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number, currency = "EUR") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { color: "bg-green-100 text-green-800", label: "Confirmé" },
      PROCESSING: { color: "bg-yellow-100 text-yellow-800", label: "En cours" },
      FAILED: { color: "bg-red-100 text-red-800", label: "Échoué" },
      REFUNDED: { color: "bg-gray-100 text-gray-800", label: "Remboursé" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PROCESSING
    return <Badge className={config.color}>{config.label}</Badge>
  }

  // Calculate growth percentages (mock calculation)
  const revenueGrowth = 23.5 // This would come from API
  const bookingsGrowth = 15.2
  const avgOrderGrowth = 8.7

  const StatCard = ({ title, value, icon: Icon, color, growth, isPositive = true }: any) => (
    <ContentCard className="group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {growth && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}
                {growth}%
              </span>
              <span className="text-sm text-gray-500">vs période précédente</span>
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
      {/* Error notification */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Attention:</strong> Utilisation des données de démonstration. {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button onClick={() => setError(null)} className="text-yellow-400 hover:text-yellow-600">
                <span className="sr-only">Fermer</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Mes Revenus</h1>
          <p className="text-lg text-gray-600">Suivez vos performances financières</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus totaux"
          value={formatCurrency(earningsData.totalRevenue)}
          icon={DollarSign}
          color="from-[#FEAC19] to-orange-500"
          growth={revenueGrowth}
        />
        <StatCard
          title="Revenus ce mois"
          value={formatCurrency(earningsData.monthlyRevenue)}
          icon={TrendingUp}
          color="from-green-500 to-green-600"
          growth={bookingsGrowth}
        />
        <StatCard
          title="Total réservations"
          value={earningsData.totalBookings.toString()}
          icon={Users}
          color="from-blue-500 to-blue-600"
          growth={bookingsGrowth}
        />
        <StatCard
          title="Panier moyen"
          value={formatCurrency(earningsData.averageOrderValue)}
          icon={BarChart3}
          color="from-purple-500 to-purple-600"
          growth={avgOrderGrowth}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Tours */}
        <ContentCard className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Forfaits les plus rentables</h3>
              <p className="text-sm text-gray-600">Vos meilleures performances</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Eye className="h-4 w-4" />
              Voir tout
            </Button>
          </div>

          <div className="space-y-4">
            {earningsData.topPerformingTours.map((tour, index) => (
              <div
                key={tour.tourId}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#FEAC19]/30 hover:bg-[#FEAC19]/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FEAC19] to-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tour.tourName}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tour.bookings} réservations
                      </span>
                      <span className="flex items-center gap-1">⭐ {tour.averageRating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(tour.revenue)}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />+{Math.round((tour.revenue / earningsData.totalRevenue) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Recent Transactions */}
        <ContentCard className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Transactions récentes</h3>
              <p className="text-sm text-gray-600">Derniers paiements reçus</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              Historique
            </Button>
          </div>

          <div className="space-y-3">
            {earningsData.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {transaction.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.customerName}</p>
                    <p className="text-sm text-gray-600">{transaction.tourName}</p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Monthly Revenue Chart Placeholder */}
      <ContentCard className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Évolution des revenus</h3>
            <p className="text-sm text-gray-600">Revenus mensuels sur les 5 derniers mois</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <PieChart className="h-4 w-4" />
            Graphiques détaillés
          </Button>
        </div>

        {/* Simple bar chart representation */}
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {earningsData.monthlyBreakdown.map((month, index) => {
              const maxRevenue = Math.max(...earningsData.monthlyBreakdown.map((m) => m.revenue))
              const heightPercentage = (month.revenue / maxRevenue) * 100

              return (
                <div key={index} className="text-center space-y-2">
                  <div className="h-32 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-[#FEAC19] to-orange-400 rounded-t-lg transition-all duration-500 hover:from-[#FEAC19]/80 hover:to-orange-400/80"
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{month.month}</p>
                    <p className="text-xs text-gray-600">{formatCurrency(month.revenue)}</p>
                    <p className="text-xs text-gray-500">{month.bookings} rés.</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ContentCard>
    </div>
  )
}
