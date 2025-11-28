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

interface SuggestedVoyagesProps {
    className?: string;
    maxRecommendations?: number;
}

const SuggestedVoyages: React.FC<SuggestedVoyagesProps> = ({
    className = "",
    maxRecommendations = 6
}) => {
    const t = useTranslations('common');
    const tProfile = useTranslations('profile');
    const { isAuthenticated } = useAuthStore();
    const { getMainPageRecommendations, isLoading, error } = useRecommendations();

    const [recommendations, setRecommendations] = useState<RecommendedTour[]>([]);
    const [recommendationType, setRecommendationType] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchRecommendations();
        }
    }, [isAuthenticated]);

    const fetchRecommendations = async () => {
        try {
            setIsRefreshing(true);
            const response = await getMainPageRecommendations(maxRecommendations);
            setRecommendations(response.recommendations || []);
            setRecommendationType(response.type || '');
        } catch (err) {
            console.log('Error fetching recommendations:', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchRecommendations();
    };

    const getRecommendationTypeLabel = (type: string) => {
        switch (type) {
            case 'hybrid':
                return 'Personalized for You';
            case 'random_popular':
                return 'Popular Tours';
            case 'content_hybrid':
                return 'Similar Tours';
            default:
                return 'Suggested Tours';
        }
    };

    if (!isAuthenticated) {
        return null; // Don't show recommendations for unauthenticated users
    }

    if (error && recommendations.length === 0) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
                <div className="flex items-center justify-center text-center py-8">
                    <div>
                        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Unable to load recommendations
                        </h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={handleRefresh} variant="outline">
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
            <div className="bg-gradient-to-r from-[#FEAC19] to-orange-400 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full p-2">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {getRecommendationTypeLabel(recommendationType)}
                            </h2>
                            <p className="text-white/90 text-sm">
                                Based on your preferences and travel history
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        variant="secondary"
                        size="sm"
                        disabled={isLoading || isRefreshing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(maxRecommendations)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((tour) => (
                            <Card key={tour.offer_id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                                <div className="relative">
                                    {tour.images && tour.images.length > 0 ? (
                                        <Image
                                            src={tour.images[0]}
                                            alt={tour.name}
                                            width={400}
                                            height={200}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gradient-to-br from-[#FEAC19] to-orange-400 flex items-center justify-center">
                                            <MapPin className="w-12 h-12 text-white" />
                                        </div>
                                    )}

                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-[#FEAC19] text-white">
                                            {tour.category || tour.tripType}
                                        </Badge>
                                    </div>

                                    <div className="absolute top-3 right-3">
                                        <Badge variant="secondary" className="bg-white/90 text-gray-800">
                                            ${tour.price}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-4">
                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#FEAC19] transition-colors">
                                        {tour.name}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {tour.description}
                                    </p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{tour.destinationLocation}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{tour.duration} days</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Users className="w-4 h-4" />
                                            <span>{tour.availableCapacity} spots available</span>
                                        </div>
                                    </div>

                                    <Link href={`/tours/${tour.offer_id}`} className="block">
                                        <Button className="w-full bg-[#FEAC19] hover:bg-orange-500 text-white">
                                            View Details
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {recommendations.length > 0 && (
                    <div className="text-center mt-6">
                        <Link href="/tours">
                            <Button variant="outline" size="lg">
                                View All Tours
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestedVoyages;
