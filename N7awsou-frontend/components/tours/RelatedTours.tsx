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
    Clock,
    Users,
    ArrowRight,
    Heart,
    RefreshCw,
    AlertCircle,
    Compass
} from 'lucide-react';

interface RelatedToursProps {
    tourId: number;
    className?: string;
    maxRecommendations?: number;
}

const RelatedTours: React.FC<RelatedToursProps> = ({
    tourId,
    className = "",
    maxRecommendations = 4
}) => {
    const t = useTranslations('common');
    const { isAuthenticated } = useAuthStore();
    const { getTourSpecificRecommendations, isLoading, error } = useRecommendations();

    const [recommendations, setRecommendations] = useState<RecommendedTour[]>([]);
    const [recommendationType, setRecommendationType] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (isAuthenticated && tourId) {
            fetchRecommendations();
        }
    }, [isAuthenticated, tourId]);

    const fetchRecommendations = async () => {
        try {
            setIsRefreshing(true);
            const response = await getTourSpecificRecommendations(tourId, maxRecommendations);
            setRecommendations(response.recommendations || []);
            setRecommendationType(response.type || '');
        } catch (err) {
            console.log('Error fetching related tours:', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchRecommendations();
    };

    if (!isAuthenticated) {
        return null; // Don't show recommendations for unauthenticated users
    }

    if (error && recommendations.length === 0) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
                <div className="flex items-center justify-center text-center py-8">
                    <div>
                        <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Unable to load related tours
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">{error}</p>
                        <Button onClick={handleRefresh} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
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
        <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#FEAC19]/10 rounded-full p-2">
                            <Compass className="w-6 h-6 text-[#FEAC19]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                You might also like
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Similar tours based on this destination
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading || isRefreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(maxRecommendations)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-gray-200 rounded-lg h-32 mb-3"></div>
                                <div className="space-y-2">
                                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                                    <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map((tour) => (
                            <Card key={tour.offer_id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group border">
                                <div className="flex">
                                    <div className="relative w-32 h-32 flex-shrink-0">
                                        {tour.images && tour.images.length > 0 ? (
                                            <Image
                                                src={tour.images[0]}
                                                alt={tour.name}
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#FEAC19] to-orange-400 flex items-center justify-center">
                                                <MapPin className="w-8 h-8 text-white" />
                                            </div>
                                        )}

                                        <div className="absolute top-2 left-2">
                                            <Badge className="bg-[#FEAC19] text-white text-xs">
                                                {tour.category || tour.tripType}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="flex-1 p-4">
                                        <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-[#FEAC19] transition-colors">
                                            {tour.name}
                                        </h3>

                                        <div className="space-y-1 mb-3">
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{tour.destinationLocation}</span>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{tour.duration}d</span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    <span>{tour.availableCapacity}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold text-[#FEAC19]">
                                                ${tour.price}
                                            </div>

                                            <Link href={`/tours/${tour.offer_id}`}>
                                                <Button size="sm" variant="outline" className="text-xs h-8">
                                                    View
                                                    <ArrowRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {recommendations.length > 0 && (
                    <div className="text-center mt-6">
                        <Link href="/tours">
                            <Button variant="outline">
                                Explore All Tours
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RelatedTours;
