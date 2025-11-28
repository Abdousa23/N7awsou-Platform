"use client"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export default function VoyageHeader() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/booking">
            <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Booking
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
