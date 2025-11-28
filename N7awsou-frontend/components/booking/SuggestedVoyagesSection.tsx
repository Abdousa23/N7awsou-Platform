"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecommendations, RecommendedTour } from '@/hooks/useRecommendations';
import useAuthStore from '@/store/store';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
    MapPin,
    Calendar,
    Users,
    Star,
    ArrowRight,
    Sparkles,
    RefreshCw,
    AlertCircle,
    Clock,
    DollarSign
} from 'lucide-react';

const SuggestedVoyagesSection: React.FC = () => {
    const t = useTranslations('booking.suggested_voyages');
    const { isAuthenticated } = useAuthStore();
    const { getMainPageRecommendations, isLoading } = useRecommendations();

    const [recommendations, setRecommendations] = useState<RecommendedTour[]>([]);
    const [recommendationType, setRecommendationType] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchRecommendations();
        }
    }, [isAuthenticated]);

    const fetchRecommendations = async () => {
        try {
            const response = await getMainPageRecommendations(6);
            setRecommendations(response.recommendations || []);
            setRecommendationType(response.type || '');
            setError(response.error || null);
        } catch (err) {
            console.log('Error fetching recommendations:', err);
            setError('Failed to load recommendations');
        }
    };

    if (!isAuthenticated) {
        return null; // Don't show for unauthenticated users
    }

    if (error && recommendations.length === 0) {
        return (
            <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center text-center py-8">
                    <div>
                        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t('error_title')}
                        </h3>
                        <p className="text-gray-600 mb-4">{t('error_subtitle')}</p>
                        <Button onClick={fetchRecommendations} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {t('try_again')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0 && !isLoading) {
        return null; // Don't render if no recommendations
    }

    return (
        <div className="my-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                {t('title')}
                <span className="block text-lg font-normal text-gray-600 mt-2">
                    {t('subtitle')}
                </span>
            </h3>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#FEAC19]" />
                    <span className="ml-2 text-gray-600">{t('loading')}</span>
                </div>
            )}

            {/* Recommendations Grid */}
            {!isLoading && recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((tour) => (
                        <Link
                            key={tour.offer_id}
                            href={`/booking/${tour.offer_id}`}
                            className="group block"
                        >
                            <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-b from-white to-gray-50">
                                <div className="relative">
                                    {tour.images && tour.images.length > 0 ? (
                                        <Image
                                            src={tour.images[0]}
                                            alt={tour.name}
                                            width={400}
                                            height={240}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gradient-to-br from-[#FEAC19] to-orange-400 flex items-center justify-center">
                                            <MapPin className="w-12 h-12 text-white" />
                                        </div>
                                    )}

                                    {/* Overlay with trip type */}
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-white/90 text-gray-800 border-0">
                                            {tour.tripType}
                                        </Badge>
                                    </div>

                                    {/* Price badge */}
                                    <div className="absolute top-3 right-3">
                                        <Badge className="bg-[#FEAC19] text-white border-0 font-semibold">
                                            ${tour.price}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#FEAC19] transition-colors line-clamp-2">
                                            {tour.name}
                                        </h3>

                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {tour.description}
                                        </p>

                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span className="truncate">{tour.destinationLocation}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{tour.duration} days</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {tour.availableCapacity} spots left
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 text-[#FEAC19]">
                                                <span className="text-sm font-medium">View Details</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuggestedVoyagesSection;
