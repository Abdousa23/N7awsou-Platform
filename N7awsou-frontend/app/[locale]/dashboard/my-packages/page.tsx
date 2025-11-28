"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { axiosPrivate } from "@/api/axios"
import { useTranslations } from "next-intl"

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

export default function MyPackagesPage() {
  const t = useTranslations("my-packages")
  const { user, accessToken } = useAuthStore()
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

  // API Functions - Fetch all tours and filter by seller on frontend since API doesn't have seller-specific endpoint
  const fetchMyTours = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build filter parameters
      const filterParams: TourFilterDto = {}
      if (searchTerm) {
        filterParams.destinationLocation = searchTerm
      }
      if (filterStatus === "active") {
        filterParams.availability = true
      }

      const response = await axiosPrivate.get("/tours", {
        params: filterParams,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      // Filter tours by seller - only show tours created by this seller
      const allTours = response.data
      const myTours = allTours.filter((tour: Tour) => tour.sellerId === user?.id)
      setPackages(myTours)
    } catch (err: any) {
      console.log("Error fetching my tours:", err)
      setError(err.response?.data?.message || "Failed to fetch your tours")
      setPackages([])
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
      throw new Error(err.response?.data?.message || "Failed to create tour")
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
      throw new Error(err.response?.data?.message || "Failed to update tour")
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
      throw new Error(err.response?.data?.message || "Failed to delete tour")
    }
  }

  const uploadImages = async (images: File[]): Promise<string[]> => {
    try {
      const formData = new FormData()
      images.forEach((image) => {
        formData.append("files", image)
      })

      const response = await axiosPrivate.post("/image/upload-multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      return response.data.map((result: any) => result.secure_url)
    } catch (err: any) {
      console.log("Error uploading images:", err)
      throw new Error(err.response?.data?.message || "Failed to upload images")
    }
  }

  // Effects
  useEffect(() => {
    if (user && user.role === "VENDEUR") {
      fetchMyTours()
    }
  }, [user, accessToken, searchTerm, filterStatus])

  // Redirect if not a seller
  if (user && user.role !== "VENDEUR") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900">{t("accessDenied")}</h2>
          <p className="text-gray-600">{t("sellersOnly")}</p>
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
          <p className="text-gray-600">{t("loadingPackages")}</p>
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
      maxCapacity: pkg.maxCapacity,
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
        category: formData.category,
        includedFeatures: formData.includedFeatures,
        dressCode: formData.dressCode,
        sellerId: user?.id ? parseInt(user.id, 10) : undefined,
        images: formData.images, // Add existing images
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
      alert(err.message || t("errorSave"))
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePackage = async (packageId: number) => {
    if (!confirm(t("confirmDelete"))) {
      return
    }

    try {
      await deleteTour(packageId)
      setPackages(packages.filter((pkg) => pkg.id !== packageId))
    } catch (err: any) {
      console.log("Error deleting tour:", err)
      alert(err.message || t("errorDelete"))
    }
  }

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destinationLocation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && pkg.available) ||
      (filterStatus === "closed" && !pkg.available)
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalPackages: packages.length,
    activePackages: packages.filter((p) => p.available).length,
    totalRevenue: packages.reduce((sum, p) => sum + p.price * (p.maxCapacity - p.availableCapacity), 0),
    totalBookings: packages.reduce((sum, p) => sum + (p.maxCapacity - p.availableCapacity), 0),
  }

  const getStatusBadge = (available: boolean) => {
    return available ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        {t("statusActive")}
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        {t("statusClosed")}
      </Badge>
    )
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
              <span className="text-sm text-gray-500">{t("vsLastMonth")}</span>
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

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("title")}</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddPackage} className="bg-[#FEAC19] hover:bg-[#FEAC19]/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> {t("addNewPackage")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("totalPackages")}
          value={stats.totalPackages}
          icon={Package}
          color="from-sky-500 to-blue-600"
        />
        <StatCard
          title={t("activePackages")}
          value={stats.activePackages}
          icon={Plane}
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          title={t("totalRevenue")}
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          title={t("totalBookings")}
          value={stats.totalBookings}
          icon={Users}
          color="from-purple-500 to-violet-600"
        />
      </div>

      {/* Main Content */}
      <ContentCard>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="closed">{t("closed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Packages List */}
        <div className="space-y-4">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={pkg.images[0] || "/placeholder.svg"}
                    alt={pkg.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-gray-900">{pkg.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{pkg.destinationLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(pkg.departureDate).toLocaleDateString()} -{" "}
                        {new Date(pkg.returnDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-end md:text-right gap-4 w-full md:w-auto">
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-gray-900">{formatCurrency(pkg.price)}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>
                        {pkg.maxCapacity - pkg.availableCapacity} / {pkg.maxCapacity} {t("booked")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(pkg.available)}
                    <Button variant="outline" size="icon" onClick={() => handleEditPackage(pkg)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t("edit")}</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeletePackage(pkg.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t("delete")}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">{t("noPackagesFound")}</h3>
              <p className="mt-1 text-sm text-gray-500">{t("noPackagesDescription")}</p>
            </div>
          )}
        </div>
      </ContentCard>

      {/* Dialog for Add/Edit Package */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingPackage ? t("editPackageTitle") : t("addPackageTitle")}</DialogTitle>
            <DialogDescription>
              {editingPackage ? t("editPackageDescription") : t("addPackageDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t("packageName")}</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureDate">{t("departureDate")}</Label>
                  <Input
                    id="departureDate"
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => handleDepartureDateChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="returnDate">{t("returnDate")}</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => handleReturnDateChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureLocation">{t("departureLocation")}</Label>
                  <Input
                    id="departureLocation"
                    value={formData.departureLocation}
                    onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="destinationLocation">{t("destination")}</Label>
                  <Input
                    id="destinationLocation"
                    value={formData.destinationLocation}
                    onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t("price")}</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">{t("duration")}</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxCapacity">{t("maxCapacity")}</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="tripType">{t("tripType")}</Label>
                  <Select
                    value={formData.tripType}
                    onValueChange={(value) => setFormData({ ...formData, tripType: value as TripType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trip type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TripType.STANDARD}>{t("tripTypeStandard")}</SelectItem>
                      <SelectItem value={TripType.CUSTOM}>{t("tripTypeCustom")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">{t("category")}</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("includedServices")}</Label>
                <div className="space-y-2">
                  {formData.includedFeatures.map((service, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                      <span className="text-sm">{service}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveService(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder={t("addServicePlaceholder")}
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={handleServiceKeyPress}
                  />
                  <Button onClick={handleAddService}>{t("add")}</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="dressCode">{t("dressCode")}</Label>
                <Input
                  id="dressCode"
                  value={formData.dressCode}
                  onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("images")}</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Package image ${index + 1}`} className="w-full h-24 rounded-md object-cover" />
                    </div>
                  ))}
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New image ${index + 1}`}
                        className="w-full h-24 rounded-md object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleRemoveSelectedImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-center w-full">
                  <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500 text-center">
                        <span className="font-semibold">{t("uploadImages")}</span> {t("imageUploadPrompt")}
                      </p>
                    </div>
                    <Input id="image-upload" type="file" className="hidden" multiple onChange={handleImageSelect} />
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleSavePackage} disabled={uploading}>
              {uploading ? t("saving") : t("saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
