"use client"
import { Shield, Award, Camera, Utensils, Wifi, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "next-intl"

interface Currency {
  code: string
  name: string
  symbol: string
}

interface BookingSidebarProps {
  voyage: {
    price: number
    maxGuests: number
    departure: string
  }
  selectedCurrency: Currency
  onCurrencyChange: (currency: Currency) => void
  formatPrice: (price: number) => string
  currencyLoading: boolean
  lastUpdated: Date | null
  onRefreshRates: () => void
  guests: number
  onGuestsChange: (guests: number) => void
  selectedDate: string
  onDateChange: (date: string) => void
  onBooking: () => void
  availableCapacity: number
  supportedCurrencies: Currency[]
}

export default function BookingSidebar({
  voyage,
  selectedCurrency,
  onCurrencyChange,
  formatPrice,
  currencyLoading,
  lastUpdated,
  onRefreshRates,
  guests,
  onGuestsChange,
  selectedDate,
  onDateChange,
  onBooking,
  availableCapacity,
  supportedCurrencies,
}: BookingSidebarProps) {
  const t = useTranslations("voyage")

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          {/* Currency Selector */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">{t("currency")}</label>
              <button
                onClick={onRefreshRates}
                disabled={currencyLoading}
                className="text-xs text-[#FEAC19] hover:text-orange-500 disabled:opacity-50"
                title={t("refreshRates")}
              >
                {currencyLoading ? t("updating") : t("refreshRates")}
              </button>
            </div>
            <Select
              value={selectedCurrency.code}
              onValueChange={(value) => {
                const currency = supportedCurrencies.find((c) => c.code === value)
                if (currency) onCurrencyChange(currency)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{selectedCurrency.symbol}</span>
                    <span>{selectedCurrency.code}</span>
                    <span className="text-gray-500">-</span>
                    <span className="text-gray-500 text-sm">{selectedCurrency.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {supportedCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-gray-500">-</span>
                      <span className="text-gray-500 text-sm">{currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lastUpdated && (
              <div className="text-xs text-gray-500 mt-1">
                {t("ratesUpdated")}: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-[#FEAC19]">
              {currencyLoading ? <div className="animate-pulse">{t("loading")}</div> : formatPrice(voyage.price)}
            </div>
            <div className="text-gray-500">{t("perPerson")}</div>
          </div>

          <div className="space-y-4">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("departureDate")}</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Guest Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("numberOfGuests")}</label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGuestsChange(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                  className="w-10 h-10 p-0"
                >
                  -
                </Button>
                <div className="flex-1 text-center py-2 border rounded-md bg-gray-50">
                  <span className="font-medium">{guests}</span>
                  <span className="text-gray-500 text-sm ml-1">{t("guests")}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGuestsChange(Math.min(availableCapacity, guests + 1))}
                  disabled={guests >= availableCapacity}
                  className="w-10 h-10 p-0"
                >
                  +
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t("maximum")} {availableCapacity} {t("guestsAvailable")}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {formatPrice(voyage.price)} × {guests} {t("guests")}
                </span>
                <span className="text-gray-800">{formatPrice(voyage.price * guests)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("serviceFee")}</span>
                <span className="text-gray-800">{formatPrice(99)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>{t("total")}</span>
                <span className="text-[#FEAC19]">{formatPrice(voyage.price * guests + 99)}</span>
              </div>
              {selectedCurrency.code !== "USD" && !currencyLoading && (
                <div className="text-xs text-gray-400 text-right mt-1">
                  {t("totalInUSD")}: ${(voyage.price * guests + 99).toFixed(2)}
                </div>
              )}
            </div>

            {/* Book Button */}
            <Button
              onClick={onBooking}
              disabled={!selectedDate || guests < 1}
              className="w-full bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("bookNow")}
            </Button>

            {/* Additional Info */}
            <div className="text-center space-y-2 pt-4 border-t">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-2" />
                {t("freeCancellation")}
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Award className="w-4 h-4 mr-2" />
                {t("bestPriceGuarantee")}
              </div>
            </div>
          </div>
        </div>

        {/* Trip Features */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mt-6">
          <h3 className="font-semibold text-gray-800 mb-4">{t("tripFeatures")}</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Camera className="w-4 h-4 mr-3 text-[#FEAC19]" />
              <span>{t("photoOpportunities")}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Utensils className="w-4 h-4 mr-3 text-[#FEAC19]" />
              <span>{t("localCuisineIncluded")}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Wifi className="w-4 h-4 mr-3 text-[#FEAC19]" />
              <span>{t("freeWifiAvailable")}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Car className="w-4 h-4 mr-3 text-[#FEAC19]" />
              <span>{t("transportationIncluded")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
