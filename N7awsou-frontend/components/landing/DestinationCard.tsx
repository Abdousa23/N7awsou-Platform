import React from 'react'
import Image from 'next/image';
import { MapPin, Calendar, DollarSign } from 'lucide-react';

export type DestinationCardProps = {
    destination: string;
    price: string;
    duration: string;
    image: string;
};

export default function DestinationCard({ destination, price, duration, image }: DestinationCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
            {/* Image Container */}
            <div className="relative overflow-hidden h-80 w-full">
                <Image
                    src={image}
                    alt={destination}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Destination and Price */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FEAC19] transition-colors duration-200">
                        {destination}
                    </h3>
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-gray-900">{price}</span>
                    </div>
                </div>

                {/* Duration with Location Icon */}
                <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 text-gray-900 mr-2" />
                    <span className="text-sm">{duration}</span>
                </div>


            </div>
        </div>
    )
}
