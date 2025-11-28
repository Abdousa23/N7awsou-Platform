"use client"
import { MapPin, Clock, Calendar, Check } from "lucide-react"
import { useTranslations } from "next-intl"

interface VoyageInfoProps {
  voyage: {
    title: string
    destination: string
    duration: string
    departure: string
    description: string
    highlights: string[]
    includes: string[]
    itinerary: Array<{
      day: number
      location: string
      activity: string
    }>
  }
}

export default function VoyageInfo({ voyage }: VoyageInfoProps) {
  const t = useTranslations("voyage")

  return (
    <div className="space-y-8">
      {/* Title and Basic Info */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{voyage.title}</h1>
        <div className="flex items-center space-x-6 text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{voyage.destination}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            <span>{voyage.duration}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            <span>{new Date(voyage.departure).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("aboutTrip")}</h2>
        <p className="text-gray-600 leading-relaxed">{voyage.description}</p>
      </div>

      {/* Highlights */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("tripHighlights")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {voyage.highlights.map((highlight: string, index: number) => (
            <div key={index} className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("whatsIncluded")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {voyage.includes.map((item: string, index: number) => (
            <div key={index} className="flex items-center">
              <Check className="w-5 h-5 text-[#FEAC19] mr-3 flex-shrink-0" />
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Itinerary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("detailedItinerary")}</h2>
        <div className="space-y-4">
          {voyage.itinerary.map((day: any, index: number) => (
            <div
              key={index}
              className="flex space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#FEAC19] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {day.day}
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-800">{day.location}</h3>
                <p className="text-gray-600 text-sm mt-1">{day.activity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
