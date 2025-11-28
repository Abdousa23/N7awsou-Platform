"use client"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface BookingHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onToggleFilters: () => void
  onSearch: () => void
}

export default function BookingHeader({ searchQuery, onSearchChange, onToggleFilters, onSearch }: BookingHeaderProps) {
  const t = useTranslations("booking.header")

  return (
    <div className="relative py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FEAC19] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          {t("title")}
          <span className="block bg-gradient-to-r from-[#FEAC19] via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">{t("subtitle")}</p>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-xl">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-800 placeholder-gray-500 h-12 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
              />
            </div>
            <Button
              onClick={onToggleFilters}
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-6"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              {t("filters")}
            </Button>
            <Button
              onClick={onSearch}
              className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold h-12 px-8"
            >
              <Search className="w-5 h-5 mr-2" />
              {t("search")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
