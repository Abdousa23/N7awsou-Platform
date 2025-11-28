"use client"
import { X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Array<{ id: string; name: string; icon: any }>
  tripTypes: Array<{ id: string; name: string }>
  durationOptions: Array<{ id: string; name: string }>
  ratingOptions: Array<{ id: string; name: string }>
  availabilityOptions: Array<{ id: string; name: string }>
  selectedCategory: string
  selectedType: string
  selectedDuration: string
  selectedRating: string
  selectedAvailability: string
  priceRange: number[]
  departureDate: string
  sortBy: string
  onCategoryChange: (category: string) => void
  onTypeChange: (type: string) => void
  onDurationChange: (duration: string) => void
  onRatingChange: (rating: string) => void
  onAvailabilityChange: (availability: string) => void
  onPriceRangeChange: (range: number[]) => void
  onDepartureDateChange: (date: string) => void
  onSortByChange: (sort: string) => void
  onClearFilters: () => void
  onApplyFilters: () => void
  filteredTripsCount: number
}

export default function FilterModal({
  isOpen,
  onClose,
  categories,
  tripTypes,
  durationOptions,
  ratingOptions,
  availabilityOptions,
  selectedCategory,
  selectedType,
  selectedDuration,
  selectedRating,
  selectedAvailability,
  priceRange,
  departureDate,
  sortBy,
  onCategoryChange,
  onTypeChange,
  onDurationChange,
  onRatingChange,
  onAvailabilityChange,
  onPriceRangeChange,
  onDepartureDateChange,
  onSortByChange,
  onClearFilters,
  onApplyFilters,
  filteredTripsCount,
}: FilterModalProps) {
  const t = useTranslations("booking.filterModal")

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">{t("title")}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Categories */}
            <div>
              <h4 className="text-gray-800 font-semibold mb-4 text-lg">{t("categories")}</h4>
              <div className="space-y-3">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => onCategoryChange(category.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                        selectedCategory === category.id
                          ? "bg-gradient-to-r from-[#FEAC19]/20 to-orange-400/20 text-[#FEAC19] border border-[#FEAC19]/40 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Trip Types */}
            <div>
              <h4 className="text-gray-800 font-semibold mb-4 text-lg">{t("tripType")}</h4>
              <div className="space-y-3">
                {tripTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => onTypeChange(type.id)}
                    className={`w-full flex items-center justify-center p-3 rounded-xl transition-colors ${
                      selectedType === type.id
                        ? "bg-gradient-to-r from-[#FEAC19]/20 to-orange-400/20 text-[#FEAC19] border border-[#FEAC19]/40 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <span className="font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h4 className="text-gray-800 font-semibold mb-4 text-lg">{t("duration")}</h4>
              <div className="space-y-3">
                {durationOptions.map((duration) => (
                  <button
                    key={duration.id}
                    onClick={() => onDurationChange(duration.id)}
                    className={`w-full flex items-center justify-center p-3 rounded-xl transition-colors ${
                      selectedDuration === duration.id
                        ? "bg-gradient-to-r from-[#FEAC19]/20 to-orange-400/20 text-[#FEAC19] border border-[#FEAC19]/40 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <span className="font-medium">{duration.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-gray-800 font-semibold mb-4 text-lg">{t("rating")}</h4>
              <div className="space-y-3">
                {ratingOptions.map((rating) => (
                  <button
                    key={rating.id}
                    onClick={() => onRatingChange(rating.id)}
                    className={`w-full flex items-center justify-center p-3 rounded-xl transition-colors ${
                      selectedRating === rating.id
                        ? "bg-gradient-to-r from-[#FEAC19]/20 to-orange-400/20 text-[#FEAC19] border border-[#FEAC19]/40 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{rating.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h4 className="text-gray-800 font-semibold mb-4 text-lg">{t("availability")}</h4>
              <div className="space-y-3">
                {availabilityOptions.map((availability) => (
                  <button
                    key={availability.id}
                    onClick={() => onAvailabilityChange(availability.id)}
                    className={`w-full flex items-center justify-center p-3 rounded-xl transition-colors ${
                      selectedAvailability === availability.id
                        ? "bg-gradient-to-r from-[#FEAC19]/20 to-orange-400/20 text-[#FEAC19] border border-[#FEAC19]/40 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <span className="font-medium">{availability.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-gray-800 font-semibold mb-4 text-lg">{t("priceRange")}</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">{t("minPrice")}</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={priceRange[0]}
                      onChange={(e) => onPriceRangeChange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#FEAC19] focus:ring-1 focus:ring-[#FEAC19] outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">{t("maxPrice")}</label>
                    <input
                      type="number"
                      placeholder="3000"
                      value={priceRange[1]}
                      onChange={(e) => onPriceRangeChange([priceRange[0], Number.parseInt(e.target.value) || 3000])}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#FEAC19] focus:ring-1 focus:ring-[#FEAC19] outline-none"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {t("priceRange")}: ${priceRange[0]} - ${priceRange[1]}
                </div>
              </div>
            </div>
          </div>

          {/* Departure Date */}
          <div className="mt-8">
            <h4 className="text-gray-800 font-semibold mb-4 text-lg">{t("departureDate")}</h4>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => onDepartureDateChange(e.target.value)}
              className="w-full max-w-md p-3 border border-gray-200 rounded-xl focus:border-[#FEAC19] focus:ring-1 focus:ring-[#FEAC19] outline-none"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Sort By */}
          <div className="mt-8">
            <h4 className="text-gray-800 font-semibold mb-4 text-lg">{t("sortBy")}</h4>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full max-w-md p-3 border border-gray-200 rounded-xl focus:border-[#FEAC19] focus:ring-1 focus:ring-[#FEAC19] outline-none bg-white"
            >
              <option value="popularity">{t("popularity")}</option>
              <option value="price-low">{t("priceLowToHigh")}</option>
              <option value="price-high">{t("priceHighToLow")}</option>
              <option value="rating">{t("rating")}</option>
              <option value="duration">{t("duration")}</option>
              <option value="departure">{t("departureDate")}</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex items-center justify-between space-x-4">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="px-6 py-3 text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              {t("clearAll")}
            </Button>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={onApplyFilters}
                className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white px-8 py-3 font-semibold"
              >
                {t("applyFilters")} ({filteredTripsCount} {t("trips")})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
