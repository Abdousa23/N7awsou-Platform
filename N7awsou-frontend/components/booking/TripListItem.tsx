"use client"

import { useState } from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { MapPin, Clock, Calendar, Star, Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import type { Tour } from "@/types"

interface TripListItemProps {
  tour: Tour
}

export default function TripListItem({ tour }: TripListItemProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const t = useTranslations("booking.tripListItem")

  const convertTourToTrip = (tour: Tour) => ({
    id: tour.id,
    title: tour.name,
    destination: tour.destinationLocation,
    image: tour.images?.[0] || "/europe.jpg",
    price: tour.price,
    duration: `${tour.duration} ${t("days")}`,
    rating: tour.Rating,
    reviews: Math.floor(Math.random() * 200) + 50,
    category: tour.category || "cultural",
    type: tour.tripType.toLowerCase(),
    departure: tour.departureDate.split("T")[0],
    description: tour.description,
    highlights: tour.includedFeatures.slice(0, 5),
    availability: tour.availableCapacity > 0 ? t("available") : t("limited"),
  })

  const trip = convertTourToTrip(tour)

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 overflow-hidden hover:bg-white transition-all duration-300 group shadow-lg hover:shadow-xl">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-80 h-48 md:h-56">
          <Image
            src={trip.image || "/placeholder.svg"}
            alt={trip.title}
            width={320}
            height={224}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleFavorite}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                trip.availability === t("available") ? "bg-green-500 text-white" : "bg-orange-500 text-white"
              }`}
            >
              {trip.availability}
            </span>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-[#FEAC19] text-white rounded-full text-xs font-bold uppercase">
              {trip.type}
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-[#FEAC19] transition-colors mb-2">
                  {trip.title}
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{trip.destination}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-600 font-medium">{trip.rating}</span>
                <span className="text-gray-500 text-sm">({trip.reviews})</span>
              </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-3">{trip.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {trip.highlights.map((highlight: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600">
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {trip.duration}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(trip.departure).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-[#FEAC19]">€{trip.price}</div>
                <div className="text-sm text-gray-500">{t("perPerson")}</div>
              </div>
              <Link href={`/booking/${tour.id}`}>
                <Button className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold px-8">
                  {t("bookNow")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
