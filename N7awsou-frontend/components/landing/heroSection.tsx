"use client"

import { Outfit } from "next/font/google"
import { useEffect } from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import CountUp from "react-countup"
import AOS from "aos"
import "aos/dist/aos.css"
import { useTranslations } from "next-intl"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export default function HeroSection() {
  const t = useTranslations("hero")

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 100,
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            {/* Main Heading */}
            <div className="space-y-4" data-aos="fade-up" data-aos-delay="100">
              <h1
                className={`${outfit.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-800 leading-tight`}
              >
                {t("title")}{" "}
                <span className="bg-gradient-to-r from-[#FEAC19] via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  {t("titleHighlight")}
                </span>
              </h1>
            </div>

            {/* Description */}
            <p
              className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {t("subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4" data-aos="fade-up" data-aos-delay="300">
              <Link href="/booking" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-xl">
                  {t("exploreDestinations")}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 hover:bg-white hover:shadow-lg hover:border-[#FEAC19]/50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 rounded-xl"
                >
                  {t("joinPlatform")}
                </Button>
              </Link>
            </div>

            {/* Statistics */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-6 lg:pt-8"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FEAC19]">
                  <CountUp end={5} duration={3} separator="," suffix="K" prefix="+" />
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium mt-1 sm:mt-2">{t("happyCustomers")}</div>
              </div>

              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FEAC19]">
                  <CountUp end={100} duration={3} separator="," prefix="+" />
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium mt-1 sm:mt-2">{t("destinations")}</div>
              </div>

              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FEAC19]">
                  <CountUp end={15} duration={3} separator="," prefix="+" />
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium mt-1 sm:mt-2">
                  {t("yearsExperience")}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative order-1 lg:order-2" data-aos="fade-left" data-aos-delay="200">
            {/* Main Image Container */}
            <div className="relative z-10 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
                <Image
                  src="/Traveller.svg"
                  height={600}
                  width={600}
                  alt="Travel Adventure"
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Decorative Elements - Hidden on mobile for cleaner look */}
            <div className="hidden lg:block">
              <div
                className="absolute top-8 lg:top-10 -right-2 lg:-right-4 w-16 h-16 lg:w-20 lg:h-20 bg-[#FEAC19] bg-opacity-20 rounded-full blur-xl"
                data-aos="zoom-in"
                data-aos-delay="600"
              ></div>
              <div
                className="absolute -bottom-4 lg:-bottom-6 -left-2 lg:-left-4 w-24 h-24 lg:w-32 lg:h-32 bg-blue-200 bg-opacity-30 rounded-full blur-xl"
                data-aos="zoom-in"
                data-aos-delay="800"
              ></div>
              <div
                className="absolute top-1/2 -right-4 lg:-right-8 w-12 h-12 lg:w-16 lg:h-16 bg-orange-200 bg-opacity-40 rounded-full blur-lg"
                data-aos="zoom-in"
                data-aos-delay="700"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
