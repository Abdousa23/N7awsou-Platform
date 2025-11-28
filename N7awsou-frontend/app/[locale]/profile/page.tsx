"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  MapPin,
  Calendar,
  CreditCard,
  Settings,
  Bell,
  Shield,
  Clock,
  Plane,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import useAuthStore from "@/store/store"
import { useUserProfile, type UserProfile, type Reservation } from "@/hooks/useUserProfile"
import PageLayout from "@/components/layout/PageLayout"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function ProfilePage() {
  const t = useTranslations("navigation")
  const tCommon = useTranslations("common")
  const tProfile = useTranslations("profile")
  const { user: authUser, isAuthenticated } = useAuthStore()
  const { fetchUserProfile, updateUserProfile, fetchUserReservations } = useUserProfile()

  const [activeTab, setActiveTab] = useState<"profile" | "reservations" | "settings">("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [reservationsLoading, setReservationsLoading] = useState(false)

  // Form states - only include fields that exist in the User model
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  })

  // Fetch user profile data
  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const profile = await fetchUserProfile()
      setUserProfile(profile)
      setFormData({
        username: profile.username || "",
        email: profile.email || "",
      })
    } catch (error) {
      console.log("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch reservations
  const loadReservations = async () => {
    try {
      setReservationsLoading(true)
      const reservations = await fetchUserReservations()
      setReservations(reservations)
    } catch (error) {
      console.log("Error fetching reservations:", error)
    } finally {
      setReservationsLoading(false)
    }
  }

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true)
      const updatedProfile = await updateUserProfile(formData)
      setUserProfile(updatedProfile)
      setIsEditing(false)
    } catch (error) {
      console.log("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile()
      loadReservations()
    }
  }, [isAuthenticated])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "REFUNDED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4" />
      case "PROCESSING":
        return <Clock className="w-4 h-4" />
      case "FAILED":
        return <AlertCircle className="w-4 h-4" />
      case "REFUNDED":
        return <RefreshCw className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
                <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{tProfile("profile")}</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: "profile", label: t("profile"), icon: User },
                  { id: "reservations", label: "My Trips", icon: Plane },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-[#FEAC19] text-[#FEAC19]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Picture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#FEAC19] to-orange-400 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                          {userProfile?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full p-2 bg-transparent"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="text-lg font-semibold">{userProfile?.username}</h3>
                      <p className="text-gray-600">{userProfile?.email}</p>
                      <div className="mt-4">
                        <Badge variant={userProfile?.emailVerified ? "default" : "secondary"}>
                          {userProfile?.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {tProfile("personalInformation")}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isEditing) {
                            setIsEditing(false)
                            // Reset form data
                            setFormData({
                              username: userProfile?.username || "",
                              email: userProfile?.email || "",
                            })
                          } else {
                            setIsEditing(true)
                          }
                        }}
                      >
                        {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                        {isEditing ? tCommon("cancel") : tCommon("edit")}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        {isEditing ? (
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">{userProfile?.username || "Not set"}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">{userProfile?.email}</p>
                        )}
                      </div>

                      <div>
                        <Label>Account Type</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          <Badge variant="outline">{userProfile?.role}</Badge>
                        </p>
                      </div>

                      <div>
                        <Label>Email Verified</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          <Badge variant={userProfile?.emailVerified ? "default" : "secondary"}>
                            {userProfile?.emailVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </p>
                      </div>

                      <div>
                        <Label>Member Since</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {userProfile?.createdAt
                            ? new Date(userProfile.createdAt).toLocaleDateString()
                            : "Not available"}
                        </p>
                      </div>

                      <div>
                        <Label>Email Notifications</Label>
                        <p className="mt-1 text-sm text-gray-900">
                          <Badge variant={userProfile?.emailSubscribed ? "default" : "secondary"}>
                            {userProfile?.emailSubscribed ? "Subscribed" : "Unsubscribed"}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                          {tCommon("cancel")}
                        </Button>
                        <Button onClick={handleUpdateProfile} disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {tCommon("save")} Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === "reservations" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5" />
                    My Travel Reservations
                  </CardTitle>
                  <CardDescription>View and manage your upcoming and past travel bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {reservationsLoading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="text-center py-8">
                      <Plane className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations yet</h3>
                      <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
                      <Button onClick={() => (window.location.href = "/booking")}>Browse Tours</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reservations.map((reservation) => (
                        <Card key={reservation.id} className="border-l-4 border-l-[#FEAC19]">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">{reservation.tour.name}</h3>
                                  <Badge className={`flex items-center gap-1 ${getStatusColor(reservation.status)}`}>
                                    {getStatusIcon(reservation.status)}
                                    {reservation.status}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <div>
                                      <p className="font-medium">Departure</p>
                                      <p>{new Date(reservation.tour.departureDate).toLocaleDateString()}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <div>
                                      <p className="font-medium">Destination</p>
                                      <p>{reservation.tour.destinationLocation}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <div>
                                      <p className="font-medium">Travelers</p>
                                      <p>
                                        {reservation.numberOfPeople}{" "}
                                        {reservation.numberOfPeople === 1 ? "person" : "people"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <div>
                                      <p className="font-medium">Total</p>
                                      <p className="font-semibold">
                                        {reservation.amount} {reservation.currency}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <p className="text-sm text-gray-500">
                                    Booked on {new Date(reservation.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {reservation.tour.images && reservation.tour.images.length > 0 && (
                                <div className="flex-shrink-0">
                                  <Image
                                    src={reservation.tour.images[0] || "/placeholder.svg"}
                                    alt={reservation.tour.name}
                                    width={120}
                                    height={80}
                                    className="rounded-lg object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates about your bookings</p>
                      </div>
                      <Button variant="outline" size="sm">
                        {userProfile?.emailSubscribed ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Setup 2FA
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </PageLayout>
  )
}
