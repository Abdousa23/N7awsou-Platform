"use client"

import type React from "react"
import { useTranslations } from "next-intl"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { axiosPrivate } from "@/api/axios"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  Search,
  Filter,
  Package,
  Plane,
  DollarSign,
  TrendingUp,
  X,
  Upload,
  ImageIcon,
} from "lucide-react"

import ContentCard from "@/components/layout/ContentCard"
import { cn } from "@/lib/utils"
import { type Tour, TripType, type CreateTourDto, type TourFilterDto } from "@/types"
import useAuthStore from "@/store/store"

interface NewPackageForm {
  name: string
  description: string
  departureDate: string
  returnDate: string
  departureLocation: string
  destinationLocation: string
  price: number
  duration: number
  maxCapacity: number
  tripType: TripType
  category: string
  includedFeatures: string[]
  dressCode: string
  images: string[]
}

export default function PackagesPage() {
  const t = useTranslations('packages')
  const { user } = useAuthStore()
  const { accessToken } = useAuthStore()
  const [packages, setPackages] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "closed">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Tour | null>(null)
  const [formData, setFormData] = useState<NewPackageForm>({
    name: "",
    description: "",
    departureDate: "",
    returnDate: "",
    departureLocation: "",
    destinationLocation: "",
    price: 0,
    duration: 0,
    maxCapacity: 0,
    tripType: TripType.STANDARD,
    category: "",
    includedFeatures: [],
    dressCode: "",
    images: [],
  })
  const [newService, setNewService] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const isSeller = user?.role === "VENDEUR"

  // API Functions
  const fetchTours = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = isSeller && user?.id ? `/tours/seller/${user.id}` : "/tours"

      // Build filter parameters
      const filterParams: TourFilterDto = {}
      if (searchTerm) {
        filterParams.destinationLocation = searchTerm
      }
      if (filterStatus === "active") {
        filterParams.availability = true
      }

      const response = await axiosPrivate.get(url, {
        params: filterParams,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      setPackages(response.data)
    } catch (err: any) {
      console.log("Error fetching tours:", err)
      setError(err.response?.data?.message || t('error_loading'))
    } finally {
      setLoading(false)
    }
  }

  const createTour = async (tourData: CreateTourDto, images?: File[]) => {
    try {
      const formData = new FormData()

      // Add tour data
      Object.keys(tourData).forEach((key) => {
        const value = (tourData as any)[key]
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item))
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      // Add images
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image)
        })
      }

      const response = await axiosPrivate.post("/tours", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      return response.data
    } catch (err: any) {
      console.log("Error creating tour:", err)
      throw new Error(err.response?.data?.message || t('error_loading'))
    }
  }

  const updateTour = async (tourId: number, tourData: Partial<CreateTourDto>, images?: File[]) => {
    try {
      const formData = new FormData()

      // Add tour data
      Object.keys(tourData).forEach((key) => {
        const value = (tourData as any)[key]
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item))
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      // Add images
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image)
        })
      }

      const response = await axiosPrivate.patch(`/tours/${tourId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      return response.data
    } catch (err: any) {
      console.log("Error updating tour:", err)
      throw new Error(err.response?.data?.message || t('error_loading'))
    }
  }

  const deleteTour = async (tourId: number) => {
    try {
      await axiosPrivate.delete(`/tours/${tourId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch (err: any) {
      console.log("Error deleting tour:", err)
      throw new Error(err.response?.data?.message || t('error_loading'))
    }
  }

  // Effects
  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "VENDEUR")) {
      fetchTours()
    }
  }, [user, accessToken, searchTerm, filterStatus])

  // Redirect if not admin or seller
  if (user && user.role !== "ADMIN" && user.role !== "VENDEUR") {
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

  // Error state
  if (error && packages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900">{t('error_loading')}</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchTours} className="bg-[#FEAC19] hover:bg-[#FEAC19]/90">
            {t('retry')}
          </Button>
        </div>
      </div>
    )
  }

  const handleAddPackage = () => {
    setEditingPackage(null)
    setFormData({
      name: "",
      description: "",
      departureDate: "",
      returnDate: "",
      departureLocation: "",
      destinationLocation: "",
      price: 0,
      duration: 0,
      maxCapacity: 0,
      tripType: TripType.STANDARD,
      category: "",
      includedFeatures: [],
      dressCode: "",
      images: [],
    })
    setNewService("")
    setSelectedImages([])
    setIsDialogOpen(true)
  }

  const handleEditPackage = (pkg: Tour) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description,
      departureDate: pkg.departureDate.split("T")[0],
      returnDate: pkg.returnDate.split("T")[0],
      departureLocation: pkg.departureLocation,
      destinationLocation: pkg.destinationLocation,
      price: pkg.price,
      duration: pkg.duration,
      maxCapacity: pkg.maxCapacity || pkg.availableCapacity,
      tripType: pkg.tripType,
      category: pkg.category || "",
      includedFeatures: [...pkg.includedFeatures],
      dressCode: pkg.dressCode || "",
      images: [...pkg.images],
    })
    setNewService("")
    setSelectedImages([])
    setIsDialogOpen(true)
  }

  const handleSavePackage = async () => {
    try {
      setUploading(true)

      const tourData: CreateTourDto = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        departureDate: formData.departureDate + "T08:00:00Z",
        returnDate: formData.returnDate + "T18:00:00Z",
        departureLocation: formData.departureLocation,
        destinationLocation: formData.destinationLocation,
        duration: formData.duration,
        availableCapacity: formData.maxCapacity,
        maxCapacity: formData.maxCapacity,
        tripType: formData.tripType,
        includedFeatures: formData.includedFeatures,
        dressCode: formData.dressCode,
        images: formData.images,
      }

      if (editingPackage) {
        const updatedTour = await updateTour(editingPackage.id, tourData, selectedImages)
        setPackages(packages.map((pkg) => (pkg.id === editingPackage.id ? updatedTour : pkg)))
      } else {
        const newTour = await createTour(tourData, selectedImages)
        setPackages([...packages, newTour])
      }

      setIsDialogOpen(false)
    } catch (err: any) {
      console.log("Error saving tour:", err)
      alert(err.message || t('error_loading'))
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePackage = async (packageId: number) => {
    if (!confirm(t('delete_confirm'))) {
      return
    }

    try {
      await deleteTour(packageId)
      setPackages(packages.filter((pkg) => pkg.id !== packageId))
    } catch (err: any) {
      console.log("Error deleting tour:", err)
      alert(err.message || t('error_loading'))
    }
  }

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destinationLocation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && pkg.available !== false) ||
      (filterStatus === "closed" && pkg.available === false)
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalPackages: packages.length,
    activePackages: packages.filter((p) => p.available !== false).length,
    totalRevenue: packages.reduce((sum, p) => sum + p.price * ((p as any).bookedPeople || 0), 0),
    totalBookings: packages.reduce((sum, p) => sum + ((p as any).bookedPeople || 0), 0),
  }

  const getStatusBadge = (available?: boolean) => {
    return available !== false ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        {t('active')}
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        {t('closed')}
      </Badge>
    )
  }

  const getBookingStatus = (availableCapacity: number, bookedPeople = 0) => {
    if (availableCapacity === 0) return t('fully_booked')
    const bookedPercentage = (bookedPeople / (availableCapacity + bookedPeople)) * 100
    if (bookedPercentage > 80) return t('almost_full')
    if (bookedPercentage > 50) return t('filling_up')
    return t('available')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
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
              <span className="text-sm text-gray-500">{t('stats.vs_last_month')}</span>
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

  // Auto-calculate duration when dates change
  const calculateDuration = (departure: string, returnDate: string): number => {
    if (!departure || !returnDate) return 0
    const start = new Date(departure)
    const end = new Date(returnDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateReturnDate = (departure: string, duration: number): string => {
    if (!departure || duration <= 0) return ""
    const start = new Date(departure)
    start.setDate(start.getDate() + duration)
    return start.toISOString().split("T")[0]
  }

  const handleDepartureDateChange = (date: string) => {
    const newDuration = formData.returnDate ? calculateDuration(date, formData.returnDate) : formData.duration
    setFormData((prev) => ({
      ...prev,
      departureDate: date,
      duration: newDuration,
      ...(formData.duration > 0 && !formData.returnDate
        ? { returnDate: calculateReturnDate(date, formData.duration) }
        : {}),
    }))
  }

  const handleReturnDateChange = (date: string) => {
    const newDuration = formData.departureDate ? calculateDuration(formData.departureDate, date) : 0
    setFormData((prev) => ({
      ...prev,
      returnDate: date,
      duration: newDuration,
    }))
  }

  const handleDurationChange = (duration: number) => {
    const newReturnDate = formData.departureDate ? calculateReturnDate(formData.departureDate, duration) : ""
    setFormData((prev) => ({
      ...prev,
      duration,
      returnDate: newReturnDate,
    }))
  }

  const handleAddService = () => {
    if (newService.trim() && !formData.includedFeatures.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        includedFeatures: [...prev.includedFeatures, newService.trim()],
      }))
      setNewService("")
    }
  }

  const handleRemoveService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      includedFeatures: prev.includedFeatures.filter((_, i) => i !== index),
    }))
  }

  const handleServiceKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddService()
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages((prev) => [...prev, ...files])
  }

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-8 p-6">
      {/* Error notification */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>{t('error_connection')}</strong> {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <span className="sr-only">{t('close_notification')}</span>
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
        <h1 className="text-3xl font-bold text-gray-900">{isSeller ? t('my_title') : t('title')}</h1>
        <p className="text-lg text-gray-600">{isSeller ? t('my_subtitle') : t('subtitle')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={isSeller ? t('stats.my_packages') : t('stats.total_packages')}
          value={stats.totalPackages.toString()}
          icon={Package}
          trend="+8%"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title={t('stats.active_packages')}
          value={stats.activePackages.toString()}
          icon={Plane}
          trend="+12%"
          color="from-green-500 to-green-600"
        />
        <StatCard
          title={t('stats.total_bookings')}
          value={stats.totalBookings.toString()}
          icon={Users}
          trend="+15%"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title={isSeller ? t('stats.my_revenue') : t('stats.revenue')}
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          trend="+23%"
          color="from-[#FEAC19] to-orange-500"
        />
      </div>

      {/* Package Management */}
      <ContentCard className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('management_subtitle')}</h3>
            <p className="text-sm text-gray-600">{t('management_subtitle')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={isSeller ? t('my_search_placeholder') : t('search_placeholder')}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as "all" | "active" | "closed")}
              >
                <SelectTrigger className="pl-10 bg-gray-50 border-gray-200">
                  <SelectValue placeholder={t('filter_by_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_packages')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="closed">{t('closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Package Button */}
            <Button
              onClick={handleAddPackage}
              className="bg-gradient-to-r from-[#FEAC19] to-orange-500 hover:from-[#FEAC19]/90 hover:to-orange-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('add_package')}
            </Button>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-[#FEAC19]/30 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Package Header */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#FEAC19] transition-colors">
                      {pkg.name}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {pkg.destinationLocation}
                    </div>
                  </div>
                  {getStatusBadge(pkg.available)}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>

                {/* Package Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {pkg.duration} {t('days')}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      {(pkg as any).remainingCapacity || pkg.availableCapacity}/{pkg.availableCapacity + ((pkg as any).bookedPeople || 0)}{" "}
                      - {getBookingStatus(pkg.availableCapacity, (pkg as any).bookedPeople)}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        pkg.available === false
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : ( pkg.availableCapacity) < 5
                            ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                            : "bg-gradient-to-r from-green-500 to-green-600",
                      )}
                      style={{
                        width: `${Math.max(0, (((pkg as any).bookedPeople || 0) / (pkg.availableCapacity + ((pkg as any).bookedPeople || 0))) * 100)}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(pkg.price)}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPackage(pkg)}
                        className="hover:bg-[#FEAC19]/10 hover:border-[#FEAC19]/30 hover:text-[#FEAC19]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user?.role === "ADMIN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t('no_results')}</p>
            <p className="text-gray-500 text-sm">{t('no_results_message')}</p>
          </div>
        )}
      </ContentCard>

      {/* Add/Edit Package Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingPackage ? t('edit_package') : t('new_package')}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingPackage
                ? t('form.edit_description')
                : t('form.new_description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  {t('form.package_name')}
                </Label>
                <Input
                  id="name"
                  placeholder={t('form.package_name_placeholder')}
                  className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationLocation" className="text-gray-700">
                  {t('form.destination')}
                </Label>
                <Input
                  id="destinationLocation"
                  placeholder={t('form.destination_placeholder')}
                  className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                  value={formData.destinationLocation}
                  onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">
                {t('form.description')}
              </Label>
              <Textarea
                id="description"
                placeholder={t('form.description_placeholder')}
                className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20 min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate" className="text-gray-700">
                  {t('form.departure_date')}
                </Label>
                <Input
                  id="departureDate"
                  type="date"
                  className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                  value={formData.departureDate}
                  onChange={(e) => handleDepartureDateChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnDate" className="text-gray-700">
                  {t('form.return_date')}
                </Label>
                <Input
                  id="returnDate"
                  type="date"
                  className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                  value={formData.returnDate}
                  onChange={(e) => handleReturnDateChange(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-700">
                  {t('form.duration_days')}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="0"
                  className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                  value={formData.duration || ""}
                  onChange={(e) => handleDurationChange(Number.parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-700">
                  {t('form.price_eur')}
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCapacity" className="text-gray-700">
                  {t('form.max_capacity')}
                </Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  placeholder="0"
                  className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                  value={formData.maxCapacity || ""}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureLocation" className="text-gray-700">
                  {t('form.departure_location')}
                </Label>
                <Input
                  id="departureLocation"
                  placeholder={t('form.departure_location_placeholder')}
                  className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                  value={formData.departureLocation}
                  onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tripType" className="text-gray-700">
                  {t('form.trip_type')}
                </Label>
                <Select
                  value={formData.tripType}
                  onValueChange={(value) => setFormData({ ...formData, tripType: value as TripType })}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20">
                    <SelectValue placeholder={t('form.select_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TripType.STANDARD}>{t('trip_types.standard')}</SelectItem>
                    <SelectItem value={TripType.PREMIUM}>{t('trip_types.premium')}</SelectItem>
                    <SelectItem value={TripType.LUXURY}>{t('trip_types.luxury')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dressCode" className="text-gray-700">
                {t('form.dress_code')}
              </Label>
              <Input
                id="dressCode"
                placeholder={t('form.dress_code_placeholder')}
                className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                value={formData.dressCode}
                onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="includedFeatures" className="text-gray-700">
                {t('form.included_services')}
              </Label>
              <div className="space-y-3">
                {/* Input for adding new service */}
                <div className="flex gap-2">
                  <Input
                    placeholder={t('form.add_service')}
                    className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={handleServiceKeyPress}
                  />
                  <Button
                    type="button"
                    onClick={handleAddService}
                    disabled={!newService.trim()}
                    className="bg-[#FEAC19] hover:bg-[#FEAC19]/90 text-white px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Display current services */}
                {formData.includedFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.includedFeatures.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-[#FEAC19]/10 text-[#FEAC19] px-3 py-1 rounded-full text-sm"
                      >
                        <span>{service}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(index)}
                          className="hover:bg-[#FEAC19]/20 rounded-full p-0.5 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.includedFeatures.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    {t('form.no_services')}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label className="text-gray-700">{t('form.package_images')}</Label>
              <div className="space-y-4">
                {/* File Input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#FEAC19]/50 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#FEAC19] hover:text-[#FEAC19]/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#FEAC19]"
                      >
                        <span>{t('form.upload_images')}</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                      <p className="pl-1">{t('form.drag_drop')}</p>
                    </div>
                    <p className="text-xs text-gray-500">{t('form.image_formats')}</p>
                  </div>
                </div>

                {/* Existing Images */}
                {formData.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('form.existing_images')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected New Images Preview */}
                {selectedImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('form.new_images')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                            {file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-200 hover:bg-gray-50"
              disabled={uploading}
            >
              {t('form.cancel')}
            </Button>
            <Button
              onClick={handleSavePackage}
              disabled={
                !formData.name || !formData.destinationLocation || !formData.price || !formData.maxCapacity || uploading
              }
              className="bg-gradient-to-r from-[#FEAC19] to-orange-500 hover:from-[#FEAC19]/90 hover:to-orange-500/90 text-white"
            >
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  {t('form.uploading')}
                </>
              ) : (
                <>{editingPackage ? t('form.update_package') : t('form.create_package')}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
