"use client"

import * as React from "react"
import { Home, Package, Calendar, Users, DollarSign, Clock, TrendingUp, Building2, ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"

import { NavMain } from "@/components/ui/nav-main"
import { NavUser } from "@/components/ui/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import useAuthStore from "@/store/store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  const t = useTranslations("dashboard")

  // Admin Navigation Items
  const adminNavItems = [
    {
      title: t("backToHome"),
      url: "/",
      icon: ArrowLeft,
    },
    {
      title: t("overview"),
      url: "/dashboard",
      icon: Home,
    },
    {
      title: t("packageManagement"),
      url: "/dashboard/packages",
      icon: Package,
    },
    {
      title: t("reservations"),
      url: "/dashboard/reservations",
      icon: Calendar,
    },
    {
      title: t("users.title"),
      url: "/dashboard/users",
      icon: Users,
    },
    {
      title: t("pricing"),
      url: "/dashboard/pricing",
      icon: DollarSign,
    },
    {
      title: t("availability"),
      url: "/dashboard/availability",
      icon: Clock,
    },
  ]

  // Seller Navigation Items
  const sellerNavItems = [
    {
      title: t("backToHome"),
      url: "/",
      icon: ArrowLeft,
    },
    {
      title: t("overview"),
      url: "/dashboard",
      icon: Home,
    },
    {
      title: t("myPackages"),
      url: "/dashboard/my-packages",
      icon: Package,
    },
    {
      title: t("myReservations"),
      url: "/dashboard/my-reservations",
      icon: Calendar,
    },
    {
      title: t("earnings"),
      url: "/dashboard/earnings",
      icon: TrendingUp,
    },
  ]

  // Determine navigation items based on user role
  const navItems = React.useMemo(() => {
    if (!user) return []
    return user.role === "ADMIN" ? adminNavItems : sellerNavItems
  }, [user, t])

  // Update user data with actual user info
  const userData = React.useMemo(() => {
    if (!user) return { name: "User", email: "user@example.com", avatar: "" }
    return {
      name: user.fullName || user.username || user.email,
      email: user.email,
      avatar: "/placeholder.svg", // You can add avatar support later
    }
  }, [user])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#FEAC19] text-white">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">N7awsou Travel</span>
            <span className="truncate text-xs text-muted-foreground">{t("dashboard")}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
