"use client"

import { useState, useEffect } from "react"
import { Globe, Waves, Mountain, Building } from "lucide-react"
import Navbar from "@/components/Navbar"
import { axiosPrivate } from "@/api/axios"
import { type Tour, TripType } from "@/types"
import SuggestedVoyagesSection from "@/components/booking/SuggestedVoyagesSection"
import BookingHeader from "@/components/booking/BookingHeader"
import FilterModal from "@/components/booking/FilterModal"
import Sidebar from "@/components/booking/Sidebar"
import TripGrid from "@/components/booking/TripGrid"
import { useTranslations } from "next-intl"

// Sample data for trips (fallback)
const sampleTrips = [
  {
    id: 1,
    name: "Mediterranean Cruise",
    destinationLocation: "Barcelona, Spain",
    images: ["/europe.jpg"],
    price: 899,
    duration: 7,
    Rating: 4.8,
    category: "cruise",
    tripType: TripType.LUXURY,
    departureDate: "2025-07-15T08:00:00Z",
    returnDate: "2025-07-22T18:00:00Z",
    departureLocation: "Barcelona Port",
    description: "Explore the beautiful Mediterranean coastline with stops in Barcelona, Rome, and Nice.",
    includedFeatures: ["All-inclusive meals", "Shore excursions", "Spa access"],
    available: true,
    availableCapacity: 8,
    maxCapacity: 20,
    dressCode: "Smart casual",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
    sellerId: 1,
  },
  {
    id: 2,
    name: "Sahara Desert Adventure",
    destinationLocation: "Bejaia, Algeria",
    images: ["/bejaia.jpg"],
    price: 1299,
    duration: 10,
    Rating: 4.9,
    category: "adventure",
    tripType: TripType.PREMIUM,
    departureDate: "2025-08-01T08:00:00Z",
    returnDate: "2025-08-11T18:00:00Z",
    departureLocation: "Algiers Airport",
    description: "Experience the magic of the Sahara with camel trekking and desert camping.",
    includedFeatures: ["Camel trekking", "Desert camping", "Local cuisine"],
    available: true,
    availableCapacity: 12,
    maxCapacity: 20,
    dressCode: "Casual outdoor wear",
    createdAt: "2024-02-01T09:30:00Z",
    updatedAt: "2024-02-20T11:15:00Z",
    sellerId: 1,
  },
  {
    id: 3,
    name: "Coastal Paradise",
    destinationLocation: "Oran, Algeria",
    images: ["/oran.jpg"],
    price: 699,
    duration: 5,
    Rating: 4.6,
    category: "beach",
    tripType: TripType.STANDARD,
    departureDate: "2025-06-20T08:00:00Z",
    returnDate: "2025-06-25T18:00:00Z",
    departureLocation: "Oran City Center",
    description: "Relax on pristine beaches and explore historic coastal towns.",
    includedFeatures: ["Beach access", "Historic tours", "Water sports"],
    available: true,
    availableCapacity: 15,
    maxCapacity: 25,
    dressCode: "Beach casual",
    createdAt: "2024-01-20T11:00:00Z",
    updatedAt: "2024-02-15T16:45:00Z",
    sellerId: 2,
  },
]

export default function BookingPage() {
  const t = useTranslations("booking")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 3000])
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDuration, setSelectedDuration] = useState("all")
  const [selectedRating, setSelectedRating] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")
  const [departureDate, setDepartureDate] = useState("")
  const [sortBy, setSortBy] = useState("popularity")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filteredTrips, setFilteredTrips] = useState<Tour[]>([])
  const [allTours, setAllTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { id: "all", name: t("categories.all"), icon: Globe },
    { id: "cruise", name: t("categories.cruise"), icon: Waves },
    { id: "adventure", name: t("categories.adventure"), icon: Mountain },
    { id: "beach", name: t("categories.beach"), icon: Waves },
    { id: "cultural", name: t("categories.cultural"), icon: Building },
    { id: "city", name: t("categories.city"), icon: Building },
  ]

  const tripTypes = [
    { id: "all", name: t("tripTypes.all") },
    { id: t("tripTypes.standard").toLocaleLowerCase(), name: t("tripTypes.standard") },
    { id: t("tripTypes.premium").toLocaleLowerCase(), name: t("tripTypes.premium") },
    { id: t("tripTypes.luxury").toLocaleLowerCase(), name: t("tripTypes.luxury") },
  ]

  const durationOptions = [
    { id: "all", name: t("durationOptions.any") },
    { id: "short", name: t("durationOptions.short") },
    { id: "medium", name: t("durationOptions.medium") },
    { id: "long", name: t("durationOptions.long") },
    { id: "extended", name: t("durationOptions.extended") },
  ]

  const ratingOptions = [
    { id: "all", name: t("ratingOptions.any") },
    { id: "4.5", name: t("ratingOptions.fourPointFive") },
    { id: "4.0", name: t("ratingOptions.four") },
    { id: "3.5", name: t("ratingOptions.threePointFive") },
    { id: "3.0", name: t("ratingOptions.three") },
  ]

  const availabilityOptions = [
    { id: "all", name: t("availabilityOptions.all") },
    { id: "Available", name: t("availabilityOptions.available") },
    { id: "Limited", name: t("availabilityOptions.limited") },
  ]

  // Fetch tours from API with filters
  const fetchTours = async (filters?: {
    searchQuery?: string
    category?: string
    priceRange?: number[]
    type?: string
    availability?: string
    departureDate?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const queryParams = new URLSearchParams()

      if (filters?.searchQuery) {
        queryParams.append("destinationLocation", filters.searchQuery)
      }

      if (filters?.category && filters.category !== "all") {
        queryParams.append("category", filters.category)
      }

      if (filters?.type && filters.type !== "all") {
        queryParams.append("tripType", filters.type.toUpperCase())
      }

      if (filters?.priceRange) {
        queryParams.append("minPrice", filters.priceRange[0].toString())
        queryParams.append("maxPrice", filters.priceRange[1].toString())
      }

      if (filters?.departureDate) {
        queryParams.append("departureDate", filters.departureDate)
      }

      queryParams.append("availability", "true")

      const queryString = queryParams.toString()
      const url = queryString ? `/tours?${queryString}` : "/tours"
      const response = await axiosPrivate.get(url)
      console.log("Tours fetched:", response.data)

      const availableTours = response.data.filter((tour: Tour) => tour.available && tour.availableCapacity > 0)

      // Client-side filtering as fallback
      let filteredTours = availableTours

      if (filters?.category && filters.category !== "all") {
        filteredTours = filteredTours.filter((tour: Tour) => tour.category === filters.category)
      }

      if (filters?.type && filters.type !== "all") {
        filteredTours = filteredTours.filter((tour: Tour) => tour.tripType.toLowerCase() === filters.type)
      }

      if (filters?.availability && filters.availability !== "all") {
        filteredTours = filteredTours.filter((tour: Tour) => {
          const availability = tour.availableCapacity > 0 ? "Available" : "Limited"
          return availability === filters.availability
        })
      }

      console.log("Filtered tours:", filteredTours)

      setAllTours(availableTours)
      setFilteredTrips(filteredTours)
    } catch (err: any) {
      console.log("Error fetching tours:", err)
      setError(t("errorLoading"))
      // Fallback to sample data
      const fallbackTours = sampleTrips as Tour[]
      setAllTours(fallbackTours)
      setFilteredTrips(fallbackTours)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTours()
  }, [])

  // Update tours when filters change
  useEffect(() => {
    const filters = {
      searchQuery,
      category: selectedCategory,
      priceRange,
      type: selectedType,
      availability: selectedAvailability,
      departureDate,
    }

    const timeoutId = setTimeout(() => {
      fetchTours(filters)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory, priceRange, selectedType, selectedAvailability, departureDate])

  // Client-side sorting and duration/rating filtering
  useEffect(() => {
    let filtered = [...allTours]

    if (selectedDuration !== "all") {
      filtered = filtered.filter((tour) => {
        const matchesDuration =
          selectedDuration === "all" ||
          (selectedDuration === "short" && tour.duration <= 3) ||
          (selectedDuration === "medium" && tour.duration >= 4 && tour.duration <= 7) ||
          (selectedDuration === "long" && tour.duration >= 8 && tour.duration <= 14) ||
          (selectedDuration === "extended" && tour.duration >= 15)
        return matchesDuration
      })
    }

    if (selectedRating !== "all") {
      filtered = filtered.filter((tour) => tour.Rating >= Number.parseFloat(selectedRating))
    }

    // Sort tours
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.Rating - a.Rating
        case "duration":
          return a.duration - b.duration
        case "departure":
          return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
        default:
          return b.Rating - a.Rating
      }
    })

    setFilteredTrips(filtered)
  }, [allTours, selectedDuration, selectedRating, sortBy])

  const handleSearch = () => {
    fetchTours({
      searchQuery,
      category: selectedCategory,
      priceRange,
      type: selectedType,
      availability: selectedAvailability,
      departureDate,
    })
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedType("all")
    setSelectedDuration("all")
    setSelectedRating("all")
    setSelectedAvailability("all")
    setDepartureDate("")
    setPriceRange([0, 3000])
    setSortBy("popularity")
  }

  const handleApplyFilters = () => {
    fetchTours({
      searchQuery,
      category: selectedCategory,
      priceRange,
      type: selectedType,
      availability: selectedAvailability,
      departureDate,
    })
    setShowFilters(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FEAC19] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-2/3 left-1/3 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        <BookingHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onSearch={handleSearch}
        />

        <SuggestedVoyagesSection />

        <FilterModal
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          categories={categories}
          tripTypes={tripTypes}
          durationOptions={durationOptions}
          ratingOptions={ratingOptions}
          availabilityOptions={availabilityOptions}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          selectedDuration={selectedDuration}
          selectedRating={selectedRating}
          selectedAvailability={selectedAvailability}
          priceRange={priceRange}
          departureDate={departureDate}
          sortBy={sortBy}
          onCategoryChange={setSelectedCategory}
          onTypeChange={setSelectedType}
          onDurationChange={setSelectedDuration}
          onRatingChange={setSelectedRating}
          onAvailabilityChange={setSelectedAvailability}
          onPriceRangeChange={setPriceRange}
          onDepartureDateChange={setDepartureDate}
          onSortByChange={setSortBy}
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
          filteredTripsCount={filteredTrips.length}
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <Sidebar
              categories={categories}
              tripTypes={tripTypes}
              durationOptions={durationOptions}
              ratingOptions={ratingOptions}
              availabilityOptions={availabilityOptions}
              selectedCategory={selectedCategory}
              selectedType={selectedType}
              selectedDuration={selectedDuration}
              selectedRating={selectedRating}
              selectedAvailability={selectedAvailability}
              priceRange={priceRange}
              departureDate={departureDate}
              sortBy={sortBy}
              onCategoryChange={setSelectedCategory}
              onTypeChange={setSelectedType}
              onDurationChange={setSelectedDuration}
              onRatingChange={setSelectedRating}
              onAvailabilityChange={setSelectedAvailability}
              onPriceRangeChange={setPriceRange}
              onDepartureDateChange={setDepartureDate}
              onSortByChange={setSortBy}
              onClearFilters={handleClearFilters}
            />

            <div className="flex-1">
              <TripGrid
                trips={filteredTrips}
                // viewMode={viewMode}
                // onViewModeChange={setViewMode}
                loading={loading}
                error={error}
                onRetry={handleSearch}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
