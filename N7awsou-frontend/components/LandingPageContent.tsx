"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import DestinationCard from "./landing/DestinationCard";
import ContentCard from "./layout/ContentCard";
import { MapPin, CreditCard, Plane, Send } from "lucide-react";
import { Outfit } from "next/font/google";
import HeroSection from "./landing/heroSection";
import SponsorSlider from "./landing/SponsorSlide";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslations } from "next-intl";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function LandingPageContent() {
  const t = useTranslations("landing");

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const destinations = [
    {
      id: 1,
      destination: "Rome, Italy",
      price: "$5,42k",
      duration: "10 Days Trip",
      image: "/bejaia.jpg",
    },
    {
      id: 2,
      destination: "London, UK",
      price: "$4,2k",
      duration: "12 Days Trip",
      image: "/oran.jpg",
    },
    {
      id: 3,
      destination: "Full Europe",
      price: "$15k",
      duration: "28 Days Trip",
      image: "/europe.jpg",
    },
  ];

  return (
    <div className="relative">
      <HeroSection />

      <ContentCard
        className="mx-4 sm:mx-6 lg:mx-8 my-16 py-16"
        data-aos="fade-up"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-down">
            <span className="inline-flex items-center bg-[#FEAC19]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#FEAC19]/30 text-[#FEAC19] font-semibold text-sm uppercase tracking-wide mb-4">
              {t("topSelling")}
            </span>
            <h2
              className={`${outfit.className} text-3xl md:text-4xl font-bold text-gray-800 mb-4`}
            >
              {t("topDestinations")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("topDestinationsDescription")}
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-aos="zoom-in-up"
          >
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination.destination}
                price={destination.price}
                duration={destination.duration}
                image={destination.image}
              />
            ))}
          </div>
        </div>
      </ContentCard>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            data-aos="fade-up"
          >
            <div>
              <div className="mb-8" data-aos="fade-right">
                <div className="inline-flex items-center bg-[#FEAC19]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#FEAC19]/30 mb-4">
                  <span className="text-[#FEAC19] font-semibold text-sm uppercase tracking-wide">
                    {t("easyAndFast")}
                  </span>
                </div>
                <h2
                  className={`${outfit.className} text-3xl md:text-4xl font-bold text-gray-800 mb-4`}
                >
                  {t("bookYourTrip")}
                </h2>
              </div>

              <div className="space-y-6">
                <ContentCard
                  className="flex items-start space-x-4"
                  data-aos="fade-left"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[#FEAC19] text-white rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3
                      className={`${outfit.className} text-xl font-semibold text-gray-800 mb-2`}
                    >
                      {t("chooseDestination")}
                    </h3>
                    <p className="text-gray-600">
                      {t("chooseDestinationDescription")}
                    </p>
                  </div>
                </ContentCard>

                <div
                  className="flex items-start space-x-4"
                  data-aos="fade-left"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[#FEAC19] text-white rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3
                      className={`${outfit.className} text-xl font-semibold text-gray-900 mb-2`}
                    >
                      {t("makePayment")}
                    </h3>
                    <p className="text-gray-600">
                      {t("makePaymentDescription")}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start space-x-4"
                  data-aos="fade-left"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[#FEAC19] text-white rounded-lg flex items-center justify-center">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div>
                    <h3
                      className={`${outfit.className} text-xl font-semibold text-gray-900 mb-2`}
                    >
                      {t("reachAirport")}
                    </h3>
                    <p className="text-gray-600">
                      {t("reachAirportDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative" data-aos="fade-left">
              <div className="relative z-10">
                <Image
                  src="/cardImage.svg"
                  alt="Easy Booking Process"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className={`${outfit.className} text-2xl md:text-3xl font-bold text-gray-900 mb-4`}
            >
              {t("trustedPartners")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("trustedPartnersDescription")}
            </p>
          </div>
          <SponsorSlider />
        </div>
      </div>

      <div
        className="bg-gradient-to-br from-slate-50 to-blue-50 py-20 relative"
        data-aos="fade-up"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-40 h-40 bg-[#FEAC19] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-400 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 border border-gray-100">
            <div className="text-center mb-10">
              <h2
                className={`${outfit.className} text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight`}
              >
                {t("subscribeTitle")}{" "}
                <span className="text-[#FEAC19]">{t("subscribeTitleHighlight")}</span>{" "}
                {t("subscribeEnd")}
              </h2>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t("subscribeDescription")}
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="bg-gray-50 p-2 rounded-2xl shadow-inner">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      className="w-full px-6 py-4 bg-white rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FEAC19] focus:ring-opacity-50 text-lg border-0 shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#FEAC19] hover:bg-[#e59a16] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 whitespace-nowrap"
                  >
                    <span>{t("subscribeButton")}</span>
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
