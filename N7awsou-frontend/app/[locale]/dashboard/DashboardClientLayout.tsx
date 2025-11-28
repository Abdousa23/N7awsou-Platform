"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import AuthProvider from "@/components/AuthProvider"
import useAuthStore from "@/store/store"

const inter = Inter({ subsets: ["latin"] })

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuthStore()
  const isAuthenticated = localStorage.getItem("isAuthenticated")
  const router = useRouter()

  useEffect(() => {
    // Redirect if not authenticated or not authorized
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Check if user has dashboard access (admin or seller)
    if (!isLoading && user && user.role !== "ADMIN" && user.role !== "VENDEUR") {
      router.push("/") // Redirect to home if not admin or seller
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#FEAC19] border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if user doesn't have access
  if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "VENDEUR")) {
    return null
  }

  return (
    <html>
      <body className={inter.className}>
        <AuthProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FEAC19]/5 via-transparent to-orange-400/5 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

              <AppSidebar />
              <SidebarInset>
                <div className="min-h-full p-4 lg:p-6">{children}</div>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
