"use client"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa"
import { useTranslations } from "next-intl"

export default function Footer() {
  const t = useTranslations("footer")

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Logo Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <Image src="/fulllogo.svg" alt="N7awsou Logo" width={40} height={40} className="mr-3" />
              <span className="text-2xl font-bold text-[#FEAC19]">N7awsou</span>
            </div>
            <p className="text-gray-600 text-sm max-w-sm">{t("description")}</p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t("company")}</h3>
            <div className="space-y-3">
              <Link
                href="/about"
                className="block text-gray-600 hover:text-[#FEAC19] text-sm transition-colors duration-200"
              >
                {t("about")}
              </Link>
              <Link
                href="/careers"
                className="block text-gray-600 hover:text-[#FEAC19] text-sm transition-colors duration-200"
              >
                {t("careers")}
              </Link>
              <Link
                href="/mobile"
                className="block text-gray-600 hover:text-[#FEAC19] text-sm transition-colors duration-200"
              >
                {t("mobile")}
              </Link>
            </div>
          </div>

          {/* Contact Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t("contact")}</h3>
            <div className="space-y-3">
              <Link
                href="/help"
                className="block text-gray-600 hover:text-[#FEAC19] text-sm transition-colors duration-200"
              >
                {t("help")}
              </Link>
              <Link
                href="/press"
                className="block text-gray-600 hover:text-[#FEAC19] text-sm transition-colors duration-200"
              >
                {t("press")}
              </Link>
              <Link
                href="/affiliates"
                className="block text-gray-600 hover:text-[#FEAC19] text-sm transition-colors duration-200"
              >
                {t("affiliates")}
              </Link>
            </div>
          </div>

          {/* More Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t("more")}</h3>
            <div className="space-y-3">
              <Link
                href="/airline-fees"
                className="block text-gray-600 hover:text-[#FEAC19] text-sm transition-colors duration-200"
              >
                {t("airlineFees")}
              </Link>
              <Link
                href="/airlines"
                className="block text-gray-600 hover:text-[#FEAC19] text-sm transition-colors duration-200"
              >
                {t("airlines")}
              </Link>
              <Link
                href="/low-fare-tips"
                className="block text-gray-600 hover:text-[#FEAC19] text-sm transition-colors duration-200"
              >
                {t("lowFareTips")}
              </Link>
            </div>
          </div>

          {/* Social Media & App Download */}
          <div>
            {/* Social Media Icons */}
            <h3 className="text-gray-900 font-semibold mb-4">{t("followUs")}</h3>
            <div className="flex items-center space-x-4 mb-6">
              <Link
                href="#"
                className="w-10 h-10 bg-[#FEAC19] text-white rounded-full flex items-center justify-center hover:bg-[#e59a16] transition-colors duration-200"
              >
                <FaTwitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-[#FEAC19] text-white rounded-full flex items-center justify-center hover:bg-[#e59a16] transition-colors duration-200"
              >
                <FaFacebook className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-[#FEAC19] text-white rounded-full flex items-center justify-center hover:bg-[#e59a16] transition-colors duration-200"
              >
                <FaInstagram className="w-5 h-5" />
              </Link>
            </div>

            {/* App Download Section */}
            <div>
              <h4 className="text-gray-900 font-semibold mb-3 text-sm">{t("discoverApp")}</h4>
              <div className="space-y-2">
                <Link
                  href="#"
                  className="flex items-center bg-black text-white rounded-lg p-2 hover:bg-gray-800 transition-colors duration-200"
                >
                  <Image src="/google-play.svg" alt="Google Play" width={24} height={24} className="mr-2" />
                  <div className="text-xs">
                    <div className="text-gray-300">{t("getItOn")}</div>
                    <div className="font-semibold">{t("googlePlay")}</div>
                  </div>
                </Link>
                <Link
                  href="#"
                  className="flex items-center bg-black text-white rounded-lg p-2 hover:bg-gray-800 transition-colors duration-200"
                >
                  <Image src="/app-store.svg" alt="App Store" width={24} height={24} className="mr-2" />
                  <div className="text-xs">
                    <div className="text-gray-300">{t("downloadOn")}</div>
                    <div className="font-semibold">{t("appStore")}</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row md:justify-center md:items-center">
            <p className="text-gray-500 text-sm text-center">{t("allRightsReserved")}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
