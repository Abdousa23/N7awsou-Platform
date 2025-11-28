"use client"

import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function NotFound() {
  const t = useTranslations("errors")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center px-4">
          <div>
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">{t("pageNotFound")}</h2>
            <p className="mt-2 text-sm text-gray-600">{t("pageNotFoundDescription")}</p>
          </div>
          <div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FEAC19] hover:bg-[#e69516] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEAC19]"
            >
              {t("goBackHome")}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
