import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import DashboardClientLayout from "./DashboardClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Panel Interne – Gestion Commerciale",
  description: "Travel Agency Internal Dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>
}
