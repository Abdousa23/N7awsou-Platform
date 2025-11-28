"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { axiosPrivate } from "@/api/axios"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Users,
  Search,
  Filter,
  MapPin,
  Mail,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from "lucide-react"
import ContentCard from "@/components/layout/ContentCard"
import { cn } from "@/lib/utils"
import useAuthStore from "@/store/store"
import { useTranslations } from 'next-intl'

interface Customer {
  id: number
  username: string
  email: string
  fullName?: string
}

interface Tour {
  id: number
  name: string
  destinationLocation: string
  departureDate: string
  returnDate: string
  price: number
}


export default function MyReservationsPage() {
  const t = useTranslations('my-reservations')
  const tCommon = useTranslations('common')
  const { user , accessToken} = useAuthStore()
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED">("all")

  // Fetch reservations for seller's tours
  const fetchMyReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      // Fetch tours with payments for this seller
      const response = await axiosPrivate.get(`/tours/seller/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      
      // Transform the data structure to flatten payments into reservations
      const transformedReservations: any[] = []
      response.data.forEach((tour: any) => {
        tour.Payments.forEach((payment: any) => {
          transformedReservations.push({
            id: payment.id,
            tour: {
              id: tour.id,
              name: tour.name,
              destinationLocation: tour.destinationLocation,
              departureDate: tour.departureDate,
              returnDate: tour.returnDate,
              price: tour.price
            },
            user: payment.user,
            numberOfPeople: payment.numberOfPeople,
            amount: payment.amount,
            status: payment.status,
            currency: payment.currency || 'EUR',
            createdAt: payment.createdAt
          })
        })
      })
      
      setReservations(transformedReservations)
    } catch (err: any) {
      console.log("Error fetching my reservations:", err)
      setError(err.response?.data?.message || t('error_loading'))
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === "VENDEUR") {
      fetchMyReservations()
    }
  }, [user, accessToken])

  // Redirect if not a seller
  if (user && user.role !== "VENDEUR") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900">{t('access_denied')}</h2>
          <p className="text-gray-600">{t('access_denied_message')}</p>
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
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = 
      reservation.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.user.email && reservation.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      reservation.tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.tour.destinationLocation.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || reservation.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
        label: t('status.confirmed'),
      },
      PROCESSING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: t('status.processing'),
      },
      FAILED: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle,
        label: t('status.failed'),
      },
      REFUNDED: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: RefreshCw,
        label: t('status.refunded'),
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PROCESSING
    const IconComponent = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate stats
  const stats = {
    totalReservations: reservations.length,
    confirmedReservations: reservations.filter((r) => r.status === "COMPLETED").length,
    pendingReservations: reservations.filter((r) => r.status === "PROCESSING").length,
    totalRevenue: reservations.filter((r) => r.status === "COMPLETED").reduce((sum, r) => sum + r.amount, 0),
  }

  const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
    <ContentCard className="group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && <p className="text-sm text-gray-500">{description}</p>}
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
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>{tCommon('error')}:</strong> {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <span className="sr-only">{tCommon('close')}</span>
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('stats.total_reservations')}
          value={stats.totalReservations.toString()}
          icon={Calendar}
          color="from-blue-500 to-blue-600"
          description={t('stats.all_reservations_desc')}
        />
        <StatCard
          title={t('stats.confirmed_reservations')}
          value={stats.confirmedReservations.toString()}
          icon={CheckCircle2}
          color="from-green-500 to-green-600"
          description={t('stats.successful_payments_desc')}
        />
        <StatCard
          title={t('stats.pending_reservations')}
          value={stats.pendingReservations.toString()}
          icon={Clock}
          color="from-yellow-500 to-yellow-600"
          description={t('stats.processing_desc')}
        />
        <StatCard
          title={t('stats.total_revenue')}
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="from-[#FEAC19] to-orange-500"
          description={t('stats.confirmed_revenue_desc')}
        />
      </div>

      {/* Reservations Management */}
      <ContentCard className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('table_title')}</h3>
            <p className="text-sm text-gray-600">{t('table_subtitle')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('search_placeholder')}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                <SelectTrigger className="pl-10 bg-gray-50 border-gray-200">
                  <SelectValue placeholder={t('filter.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  <SelectItem value="COMPLETED">{t('status.confirmed')}</SelectItem>
                  <SelectItem value="PROCESSING">{t('status.processing')}</SelectItem>
                  <SelectItem value="FAILED">{t('status.failed')}</SelectItem>
                  <SelectItem value="REFUNDED">{t('status.refunded')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              {t('export')}
            </Button>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">{t('table.headers.client')}</TableHead>
                <TableHead className="font-semibold text-gray-900">{t('table.headers.package')}</TableHead>
                <TableHead className="font-semibold text-gray-900">{t('table.headers.departure_date')}</TableHead>
                <TableHead className="font-semibold text-gray-900">{t('table.headers.travelers')}</TableHead>
                <TableHead className="font-semibold text-gray-900">{t('table.headers.amount')}</TableHead>
                <TableHead className="font-semibold text-gray-900">{t('table.headers.status')}</TableHead>
                <TableHead className="font-semibold text-gray-900">{t('table.headers.booking_date')}</TableHead>
                <TableHead className="font-semibold text-gray-900">{t('table.headers.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FEAC19] to-orange-400 flex items-center justify-center text-white text-sm font-semibold">
                          {reservation.user.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {reservation.user.fullName || reservation.user.username}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {reservation.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{reservation.tour.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {reservation.tour.destinationLocation}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{formatDate(reservation.tour.departureDate)}</p>
                      <p className="text-xs text-gray-500">{t('table.return_date')}: {formatDate(reservation.tour.returnDate)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-900">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{reservation.numberOfPeople}</span>
                      <span className="text-sm text-gray-600">
                        {reservation.numberOfPeople === 1 ? t('person') : t('people')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(reservation.amount, reservation.currency)}
                    </p>
                  </TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-900">{formatDate(reservation.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-[#FEAC19]/10 hover:border-[#FEAC19]/30 hover:text-[#FEAC19] bg-transparent"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              {reservations.length === 0 ? t('no_reservations') : t('no_results')}
            </p>
            <p className="text-gray-500 text-sm">
              {reservations.length === 0
                ? t('no_reservations_message')
                : t('no_results_message')}
            </p>
          </div>
        )}
      </ContentCard>
    </div>
  )
}
