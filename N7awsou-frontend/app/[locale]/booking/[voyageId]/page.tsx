"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MapPin } from "lucide-react"
import Navbar from "@/components/Navbar"
import { axiosPrivate } from "@/api/axios"
import type { Tour } from "@/types"
import useAuthStore from "@/store/store"
import RelatedTours from "@/components/booking/RelatedTours"
import VoyageHeader from "@/components/voyage/VoyageHeader"
import VoyageGallery from "@/components/voyage/VoyageGallery"
import VoyageInfo from "@/components/voyage/VoyageInfo"
import BookingSidebar from "@/components/voyage/BookingSidebar"

// Currency types and rates
interface CurrencyRates {
  [key: string]: number
}

interface Currency {
  code: string
  name: string
  symbol: string
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "DZD", name: "Algerian Dinar", symbol: "د.ج" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "MAD" },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
]

export default function VoyageDetailsPage() {
  const params = useParams()
  const { accessToken } = useAuthStore()
  const voyageId = Number.parseInt(params.voyageId as string)
  const [guests, setGuests] = useState(1)
  const [selectedDate, setSelectedDate] = useState("")
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showError, setShowError] = useState(false)

  // Currency conversion states
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    SUPPORTED_CURRENCIES.find((c) => c.code === "DZD") || SUPPORTED_CURRENCIES[0],
  )
  const [exchangeRates, setExchangeRates] = useState<CurrencyRates>({})
  const [currencyLoading, setCurrencyLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Currency conversion functions
  const fetchExchangeRates = async () => {
    try {
      setCurrencyLoading(true)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
      const data = await response.json()

      if (data.rates) {
        setExchangeRates(data.rates)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error)
      // Fallback rates
      setExchangeRates({
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        DZD: 134.5,
        MAD: 10.2,
        TND: 3.1,
        CAD: 1.35,
        AUD: 1.52,
        JPY: 148.5,
      })
      setLastUpdated(new Date())
    } finally {
      setCurrencyLoading(false)
    }
  }

  const convertPrice = (priceInUSD: number): number => {
    if (!exchangeRates[selectedCurrency.code]) {
      return priceInUSD
    }
    return priceInUSD * exchangeRates[selectedCurrency.code]
  }

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price)

    switch (selectedCurrency.code) {
      case "JPY":
        return `${selectedCurrency.symbol}${Math.round(convertedPrice).toLocaleString()}`
      case "DZD":
      case "MAD":
      case "TND":
        return `${Math.round(convertedPrice).toLocaleString()} ${selectedCurrency.symbol}`
      default:
        return `${selectedCurrency.symbol}${convertedPrice.toFixed(2)}`
    }
  }

  // Handle booking
  const handleBooking = async () => {
    if (!tour) return

    try {
      const priceInUSD = selectedCurrency.code === "USD" ? tour.price : tour.price
      initiatePayment(priceInUSD * guests)
    } catch (err) {
      console.log("Booking error:", err)
      alert("Error creating booking. Please try again.")
    }
  }

  async function initiatePayment(totalPrice: number) {
    try {
      const response = await axiosPrivate.post("/payments/initiate", {
        tourId: voyageId,
        numberOfPeople: guests,
        notes: `Booking for ${guests} guests on ${selectedDate}`,
      })

      if (response.data.payment.formUrl) {
        window.location.href = response.data.payment.formUrl
      }
    } catch (error: any) {
      console.log("Payment error:", error)
      const errorMessage = error.response?.data?.message || "Payment initiation failed. Please try again."
      alert(errorMessage)
    }
  }

  // Convert Tour to voyage format for UI
  const convertTourToVoyage = (tour: Tour) => ({
    id: tour.id,
    title: tour.name,
    destination: tour.destinationLocation,
    image: tour.images?.[0] || "/europe.jpg",
    price: tour.price,
    duration: `${tour.duration} days`,
    rating: tour.Rating,
    category: tour.category || "cultural",
    type: tour.tripType.toLowerCase(),
    departure: tour.departureDate.split("T")[0],
    description: tour.description,
    highlights: tour.includedFeatures.slice(0, 5),
    availability: tour.availableCapacity > 0 ? "Available" : "Limited",
    maxGuests: tour.maxCapacity || 8,
    includes: tour.includedFeatures.slice(0, 4),
    itinerary: generateItinerary(tour),
    images: tour.images.length > 0 ? tour.images : ["/europe.jpg", "/bejaia.jpg", "/oran.jpg"],
  })

  // Generate itinerary based on tour duration and destination
  const generateItinerary = (tour: Tour) => {
    const days = []
    for (let i = 1; i <= tour.duration; i++) {
      if (i === 1) {
        days.push({
          day: i,
          location: tour.departureLocation,
          activity: "Arrival and check-in",
        })
      } else if (i === tour.duration) {
        days.push({
          day: i,
          location: tour.destinationLocation,
          activity: "Departure",
        })
      } else {
        days.push({
          day: i,
          location: tour.destinationLocation,
          activity: `Explore ${tour.destinationLocation} - ${tour.includedFeatures[Math.floor(Math.random() * tour.includedFeatures.length)] || "Local attractions"}`,
        })
      }
    }
    return days
  }

  // Fetch tour data from API
  const fetchTour = async () => {
    try {
      setLoading(true)
      setError(null)
      setShowError(false)
      const response = await axiosPrivate.get(`/tours/${voyageId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      setTour(response.data)
    } catch (err: any) {
      console.log("Error fetching tour:", err)
      setError("Error loading voyage")
      setTimeout(() => {
        setShowError(true)
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (voyageId) {
      fetchTour()
    }
  }, [accessToken])

  useEffect(() => {
    fetchExchangeRates()
  }, [])

  const voyage = tour ? convertTourToVoyage(tour) : null

  useEffect(() => {
    if (voyage) {
      setSelectedDate(voyage.departure)
    }
  }, [voyage])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FEAC19] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEAC19] mx-auto"></div>
              <p className="text-gray-600">Loading voyage...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error or no tour found
  if (!tour && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FEAC19] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="text-gray-500 mb-4">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Voyage not found</h3>
                <p>This voyage doesn't exist or is no longer available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FEAC19] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        <VoyageHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && showError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-600">
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            </div>
          )}

          {voyage && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  <VoyageGallery images={voyage.images} title={voyage.title} />
                  <VoyageInfo voyage={voyage} />
                </div>

                {/* Booking Sidebar */}
                <BookingSidebar
                  voyage={voyage}
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                  formatPrice={formatPrice}
                  currencyLoading={currencyLoading}
                  lastUpdated={lastUpdated}
                  onRefreshRates={fetchExchangeRates}
                  guests={guests}
                  onGuestsChange={setGuests}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onBooking={handleBooking}
                  availableCapacity={tour?.availableCapacity || voyage.maxGuests}
                  supportedCurrencies={SUPPORTED_CURRENCIES}
                />
              </div>

              <div className="mt-12">
                <RelatedTours currentTourId={voyageId} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
