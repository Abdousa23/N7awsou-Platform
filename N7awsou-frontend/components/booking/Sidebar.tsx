"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useTranslations } from "next-intl"

interface SidebarProps {
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
}

export default function Sidebar({
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
}: SidebarProps) {
  const t = useTranslations("booking.sidebar")

  return (
    <div className="lg:w-80 space-y-6 hidden lg:block">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{t("title")}</h3>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h4 className="text-gray-800 font-medium mb-3">{t("category")}</h4>
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#FEAC19]/20 text-[#FEAC19] border border-[#FEAC19]/30"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <hr className="my-4" />

        {/* Trip Types */}
        <div className="mb-6">
          <h4 className="text-gray-800 font-medium mb-3">{t("tripType")}</h4>
          <div className="space-y-2">
            {tripTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onTypeChange(type.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedType === type.id
                    ? "bg-[#FEAC19]/20 text-[#FEAC19] border border-[#FEAC19]/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        <hr className="my-4" />

        {/* Duration Filter */}
        <div className="mb-6">
          <h4 className="text-gray-800 font-medium mb-3">{t("duration")}</h4>
          <div className="space-y-2">
            {durationOptions.map((duration) => (
              <button
                key={duration.id}
                onClick={() => onDurationChange(duration.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedDuration === duration.id
                    ? "bg-[#FEAC19]/20 text-[#FEAC19] border border-[#FEAC19]/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {duration.name}
              </button>
            ))}
          </div>
        </div>

        <hr className="my-4" />

        {/* Rating Filter */}
        <div className="mb-6">
          <h4 className="text-gray-800 font-medium mb-3">{t("minimumRating")}</h4>
          <div className="space-y-2">
            {ratingOptions.map((rating) => (
              <button
                key={rating.id}
                onClick={() => onRatingChange(rating.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedRating === rating.id
                    ? "bg-[#FEAC19]/20 text-[#FEAC19] border border-[#FEAC19]/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{rating.name}</span>
                  {rating.id !== "all" && (
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(Number.parseFloat(rating.id))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <hr className="my-4" />

        {/* Availability Filter */}
        <div className="mb-6">
          <h4 className="text-gray-800 font-medium mb-3">{t("availability")}</h4>
          <div className="space-y-2">
            {availabilityOptions.map((availability) => (
              <button
                key={availability.id}
                onClick={() => onAvailabilityChange(availability.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedAvailability === availability.id
                    ? "bg-[#FEAC19]/20 text-[#FEAC19] border border-[#FEAC19]/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {availability.name}
              </button>
            ))}
          </div>
        </div>

        <hr className="my-4" />

        {/* Departure Date Filter */}
        <div className="mb-6">
          <h4 className="text-gray-800 font-medium mb-3">{t("departureDate")}</h4>
          <Input
            type="date"
            value={departureDate}
            onChange={(e) => onDepartureDateChange(e.target.value)}
            className="bg-white border-gray-300 text-gray-800 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <hr className="my-4" />

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="text-gray-800 font-medium mb-3">{t("priceRange")}</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={priceRange[0]}
                onChange={(e) => onPriceRangeChange([Number.parseInt(e.target.value), priceRange[1]])}
                className="absolute w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                style={{ zIndex: 1 }}
              />
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => onPriceRangeChange([priceRange[0], Number.parseInt(e.target.value)])}
                className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer"
                style={{ zIndex: 2 }}
              />
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <h4 className="text-gray-800 font-medium mb-3">{t("sortBy")}</h4>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
          >
            <option value="popularity">{t("popularity")}</option>
            <option value="price-low">{t("priceLowToHigh")}</option>
            <option value="price-high">{t("priceHighToLow")}</option>
            <option value="rating">{t("highestRated")}</option>
            <option value="duration">{t("duration")}</option>
            <option value="departure">{t("departureDate")}</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t("clearAllFilters")}
          </Button>
        </div>
      </div>
    </div>
  )
}
