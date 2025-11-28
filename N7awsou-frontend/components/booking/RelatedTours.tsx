"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRecommendations, RecommendedTour } from "@/hooks/useRecommendations";
import useAuthStore from "@/store/store";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Users,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Star,
} from "lucide-react";

interface RelatedToursProps {
  currentTourId: number;
  className?: string;
}

const RelatedTours: React.FC<RelatedToursProps> = ({
  currentTourId,
  className = "",
}) => {
  const t = useTranslations("booking.relatedTours");
  const { isAuthenticated } = useAuthStore();
  const { getTourSpecificRecommendations, isLoading } = useRecommendations();

  const [relatedTours, setRelatedTours] = useState<RecommendedTour[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentTourId) {
      fetchRelatedTours();
    }
  }, [currentTourId, isAuthenticated]);

  const fetchRelatedTours = async () => {
    try {
      const response = await getTourSpecificRecommendations(currentTourId, 4);
      setRelatedTours(response.recommendations || []);
      setError(response.error || null);
    } catch (err) {
      console.log("Error fetching related tours:", err);
      setError(t("error"));
    }
  };

  if (error && relatedTours.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t("title")}
        </h2>
        <div className="flex items-center justify-center text-center py-8">
          <div>
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("errorTitle")}
            </h3>
            <p className="text-gray-600 mb-4">{t("errorMessage")}</p>
            <Button onClick={fetchRelatedTours} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (relatedTours.length === 0 && !isLoading) {
    return null; // Don't render if no related tours
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("title")}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {isAuthenticated
                ? t("personalizedSubtitle")
                : t("genericSubtitle")}
            </p>
          </div>
          <Button
            onClick={fetchRelatedTours}
            size="sm"
            variant="outline"
            className="border-[#FEAC19] text-[#FEAC19] hover:bg-[#FEAC19] hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-[#FEAC19]" />
            <span className="ml-2 text-gray-600">
              {t("loadingTours")}
            </span>
          </div>
        </div>
      )}

      {/* Related Tours Grid */}
      {!isLoading && relatedTours.length > 0 && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedTours.map((tour) => (
              <Link
                key={tour.offer_id}
                href={`/booking/${tour.offer_id}`}
                className="group block"
              >
                <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-gray-200">
                  <div className="flex">
                    {/* Image */}
                    <div className="w-32 h-32 flex-shrink-0 relative">
                      {tour.images && tour.images.length > 0 ? (
                        <Image
                          src={tour.images[0]}
                          alt={tour.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#FEAC19] to-orange-400 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-white" />
                        </div>
                      )}

                      {/* Price badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-[#FEAC19] text-white border-0 text-xs font-semibold">
                          ${tour.price}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="flex-1 p-4">
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#FEAC19] transition-colors line-clamp-2 mb-2">
                            {tour.name}
                          </h3>

                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {tour.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {tour.destinationLocation}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{tour.duration} {t("days")}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {tour.tripType}
                            </Badge>

                            <div className="flex items-center gap-1 text-[#FEAC19]">
                              <span className="text-xs font-medium">
                                {t("view")}
                              </span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center mt-6">
            <Link href="/booking">
              <Button
                variant="outline"
                className="border-[#FEAC19] text-[#FEAC19] hover:bg-[#FEAC19] hover:text-white"
              >
                {t("exploreMoreTours")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* No Tours Message */}
      {!isLoading && relatedTours.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("noTours.title")}
          </h3>
          <p className="text-gray-600 mt-1">{t("noTours.message")}</p>
        </div>
      )}
    </div>
  );
};

export default RelatedTours;
