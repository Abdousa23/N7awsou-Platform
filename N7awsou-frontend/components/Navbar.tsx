"use client"
import { useState } from "react"
import Image from "next/image"
import CustomButt from "./neonButton" // Adjust the import path as necessary
// @ts-ignore
import Flag from "react-world-flags"
import useAuthStore from "@/store/store"
import { useTranslations, useLocale } from "next-intl"
import { Link, useRouter, usePathname } from "@/i18n/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)

  // Auth state and logout function
  const { isAuthenticated, user, logout } = useAuthStore()

  // Internationalization
  const t = useTranslations("navigation")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const languages = [
    { code: "en", name: "English", country: "GB" },
    { code: "fr", name: "Français", country: "FR" },
    { code: "ar", name: "العربية", country: "SA" },
  ]

  const handleLanguageChange = (language: any) => {
    setIsLanguageOpen(false)
    // Navigate to the same page but with different locale
    router.push(pathname, { locale: language.code })
  }

  const handleLogout = async () => {
    try {
      await logout()
      // Optionally redirect to home page after logout
      window.location.href = "/"
    } catch (error) {
      console.log("Logout failed:", error)
    }
  }

  return (
    <header className="bg-white  border-b  sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="N7awsou Travel" width={40} height={40} className="w-10 h-10" />
            </Link>
          </div>

          {/* Desktop Navigation + Language + Auth - All grouped together */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <nav className="flex space-x-8">
              <Link
                href="/booking"
                className="text-gray-700 hover:text-[#FEAC19] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {t("bookings")}
              </Link>
              <Link
                href="/lhawasAI"
                className="text-gray-700 hover:text-[#FEAC19] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                L7awass AI
              </Link>
              {/* Dashboard Link - Only for Admin and Seller */}
              {isAuthenticated && (user?.role === "ADMIN" || user?.role === "VENDEUR") && (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-[#FEAC19] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012-2V3a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 012 2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Language Selector */}
            <div className="flex items-center relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#FEAC19] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <span>{locale.toUpperCase()}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform duration-200 ${
                    isLanguageOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Language Dropdown */}
              {isLanguageOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language)}
                        className={`w-full text-left  px-4 py-2 text-sm flex items-center space-x-3  transition-colors duration-200 ${
                          locale === language.code
                            ? "bg-[#FEAC19] bg-opacity-10  text-white"
                            : "text-gray-700 hover:bg-[#FEAC19]"
                        }`}
                      >
                        <Flag code={language.country} style={{ width: "20px", height: "15px" }} />
                        <span>{language.name}</span>
                        {locale === language.code && (
                          <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                // Logged in state - show user info and logout
                <div className="flex items-center space-x-4">
                  <Link href="/profile">
                    <span className="text-gray-700 hover:text-[#FEAC19] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                      {user?.fullName || t("profile")}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {t("logout")}
                  </button>
                </div>
              ) : (
                // Not logged in state - show login and signup
                <>
                  <Link href="/login">
                    <button className="text-[#FEAC19] cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                      {t("login")}
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className=" hover:bg-[#FEAC19]  border-2 border-[#FEAC19] hover:text-white text-[#FEAC19] px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-md">
                      {t("signup")}
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[#FEAC19] focus:outline-none focus:text-[#FEAC19] p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
            <div className="space-y-1">
              <Link
                href="/destinations"
                className="block text-gray-700 hover:text-[#FEAC19] hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                {t("destinations")}
              </Link>
              <Link
                href="/flights"
                className="block text-gray-700 hover:text-[#FEAC19] hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                {t("flights")}
              </Link>
              <Link
                href="/bookings"
                className="block text-gray-700 hover:text-[#FEAC19] hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                {t("bookings")}
              </Link>
              <Link
                href="/lhawasAI"
                className="flex items-center gap-2 text-gray-700 hover:text-[#FEAC19] hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                AI Assistant
              </Link>
              {/* Dashboard Link - Mobile - Only for Admin and Seller */}
              {isAuthenticated && (user?.role === "ADMIN" || user?.role === "VENDEUR") && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-700 hover:text-[#FEAC19] hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012-2V3a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 012 2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Dashboard
                </Link>
              )}

              {/* Mobile Language Selector */}
              <div className="px-3 py-2">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-[#FEAC19] text-base font-medium transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span>
                      {t("language")} ({locale.toUpperCase()})
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-200 ${
                      isLanguageOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mobile Language Options */}
                {isLanguageOpen && (
                  <div className="mt-2 pl-4 space-y-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language)}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-3 rounded-md transition-colors duration-200 ${
                          locale === language.code
                            ? "bg-[#FEAC19] bg-opacity-10 text-[#FEAC19]"
                            : "text-gray-600 hover:text-[#FEAC19] hover:bg-gray-50"
                        }`}
                      >
                        <span>{language.name}</span>
                        {locale === language.code && (
                          <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-1">
              {isAuthenticated ? (
                // Logged in state - mobile
                <>
                  <Link
                    href="/profile"
                    className="block text-gray-700 hover:text-[#FEAC19] hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    {user?.fullName || t("profile")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                // Not logged in state - mobile
                <>
                  <Link
                    href="/login"
                    className="block text-gray-700 hover:text-[#FEAC19] hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    {t("login")}
                  </Link>
                  <Link href="/register" className="block px-3 py-2 font-medium">
                    <CustomButt text={t("signup")} />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
