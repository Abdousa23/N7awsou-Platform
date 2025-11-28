"use client"

import { useState } from "react"
import Image from "next/image"

interface VoyageGalleryProps {
  images: string[]
  title: string
}

export default function VoyageGallery({ images, title }: VoyageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-2xl overflow-hidden">
        <Image src={images[selectedImage] || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image: string, index: number) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === index
                ? "border-[#FEAC19] ring-2 ring-[#FEAC19]/30"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Image src={image || "/placeholder.svg"} alt={`${title} ${index + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
