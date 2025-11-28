'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';;
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface VoyageCardProps {
    voyage: {
        id: number;
        title: string;
        destination: string;
        image: string;
        price: number;
        duration: string;
        rating: number;
        trending?: boolean;
        description: string;
    };
    className?: string;
}

export default function VoyageCard({ voyage, className = "" }: VoyageCardProps) {
    const t = useTranslations('booking.voyage_card');
    console.log("VoyageCard rendered with voyage:", voyage);
    return (
        <div className={`bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 overflow-hidden hover:bg-white transition-all duration-300 group shadow-lg hover:shadow-xl ${className}`}>
            <div className="relative h-48">
                <Image
                    src={voyage.image[0]}
                    alt={voyage.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {voyage.trending && (
                    <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                            {t('trending')}
                        </span>
                    </div>
                )}
                <div className="absolute bottom-4 left-4">
                    <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white font-medium">{voyage.rating}</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#FEAC19] transition-colors mb-2">
                    {voyage.title}
                </h3>

                <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{voyage.destination}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {voyage.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {voyage.duration}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-[#FEAC19]">${voyage.price}</div>
                        <div className="text-xs text-gray-500">{t('per_person')}</div>
                    </div>
                </div>

                <Link href={`/booking/${voyage.id}`}>
                    <Button className="w-full mt-4 bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold">
                        {t('explore_trip')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
