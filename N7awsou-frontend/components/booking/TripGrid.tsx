"use client"
import { Grid3X3, List, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import TripCard from "./TripCard"
import TripListItem from "./TripListItem"
import type { Tour } from "@/types"
import { useState } from "react"

interface TripGridProps {
  trips: Tour[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onClearFilters: () => void
}

export default function TripGrid({
  trips,
  loading,
  error,
  onRetry,
  onClearFilters,
}: TripGridProps) {
  const t = useTranslations("booking.tripGrid")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEAC19] mx-auto"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 mb-4">
          <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">{t("loadingError")}</h3>
          <p>{error}</p>
        </div>
        <Button
          onClick={onRetry}
          className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold"
        >
          {t("retry")}
        </Button>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500 mb-4">
          <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">{t("noResults")}</h3>
          <p>{t("adjustFilters")}</p>
        </div>
        <Button
          onClick={onClearFilters}
          className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold"
        >
          {t("clearFilters")}
        </Button>
      </div>
    )
  }

  console.log("TripGrid rendered with trips:", trips)
  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {t("availableTrips")} ({trips.length})
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 text-sm">{t("view")}:</span>
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "grid" ? "bg-[#FEAC19] text-white" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>{t("grid")}</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list" ? "bg-[#FEAC19] text-white" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <List className="w-4 h-4" />
              <span>{t("list")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trip Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {trips.map((trip) => (
            <TripListItem key={trip.id} tour={trip} />
          ))}
        </div>
      )}

      {/* Load More */}
      {trips.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            {t("loadMoreTrips")}
          </Button>
        </div>
      )}
    </div>
  )
}
