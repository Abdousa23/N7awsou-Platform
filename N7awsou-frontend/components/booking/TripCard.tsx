"use client"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { MapPin, Clock, Calendar, Star, Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Tour } from "@/types"
import { useTranslations } from "next-intl"

interface TripCardProps {
  trip: Tour
  onToggleFavorite?: (id: number) => void
  isFavorite?: boolean
  className?: string
}

export default function TripCard({ trip, onToggleFavorite, isFavorite = false, className = "" }: TripCardProps) {
  const t = useTranslations("tripCard")

  console.log("TripCard rendered for trip:", trip)
  return (
    <div
      className={`bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 overflow-hidden hover:bg-white transition-all duration-300 group shadow-lg hover:shadow-xl ${className}`}
    >
      <div className="relative h-64">
        <Image
          src={trip?.images[0] || "/placeholder.svg"}
          alt={trip?.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {onToggleFavorite && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => onToggleFavorite(trip.id)}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              trip?.available === true ? "bg-green-500 text-white" : "bg-orange-500 text-white"
            }`}
          >
            {trip?.available ? t("available") : t("unavailable")}
          </span>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-[#FEAC19] text-white rounded-full text-xs font-bold uppercase">
            {trip.tripType}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#FEAC19] transition-colors">{trip.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-yellow-600 font-medium">{trip.Rating}</span>
            <span className="text-gray-500 text-sm">({trip.Rating})</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{trip.destinationLocation}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{trip.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {trip.includedFeatures.slice(0, 2).map((highlight, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
              {highlight}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {trip.duration}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(trip.departureLocation).toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#FEAC19]">${trip.price}</div>
            <div className="text-xs text-gray-500">{t("perPerson")}</div>
          </div>
        </div>

        <Link href={`/booking/${trip.id}`}>
          <Button className="w-full mt-4 bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold">
            {t("bookNow")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
