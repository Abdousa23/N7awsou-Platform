"use client"

import { useState, useEffect } from "react"
import useAuthStore from "@/store/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { User, Role } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  Crown,
  Users,
  Search,
  Filter,
  TrendingUp,
  UserCheck,
  Mail,
  Loader2,
  MapPin,
} from "lucide-react"
import { useTranslations } from "next-intl"

import ContentCard from "@/components/layout/ContentCard"
import { cn } from "@/lib/utils"
import { axiosPrivate } from "@/api/axios"
import { toast } from "sonner"

// Extended user role type to match backend
type ExtendedUserRole = "TOURIST" | "VENDEUR" | "ADMIN" | "GUIDE"

// API User interface
interface ApiUser {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

// Convert API user to display user
const convertApiUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  username: apiUser.username,
  email: apiUser.email,
  role: apiUser.role as Role,
  createdAt: apiUser.createdAt,
})

interface NewUser {
  username: string
  email: string
  role: ExtendedUserRole
  password: string
  phone?: string
  address?: string
}

export default function UsersPage() {
  const { user } = useAuthStore()
  const t = useTranslations("dashboard.users")
  const tCommon = useTranslations("common")

  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<ExtendedUserRole | "all">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<NewUser>({
    username: "",
    email: "",
    role: "TOURIST",
    password: "",
    phone: "",
    address: "",
  })

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axiosPrivate.get("/users")
      const apiUsers: ApiUser[] = response.data
      const convertedUsers = apiUsers.map(convertApiUser)
      setUsers(convertedUsers)
    } catch (error) {
      console.log("Error fetching users:", error)
      toast.error(t("errorFetchingUsers"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      username: "",
      email: "",
      role: "TOURIST",
      password: "",
      phone: "",
      address: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
      phone: "",
      address: "",
    })
    setIsDialogOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      setSubmitting(true)

      if (editingUser) {
        // Editing existing user
        if (formData.role === "VENDEUR" && editingUser.role !== "VENDEUR") {
          // User role changed to seller - create seller profile
          await axiosPrivate.post("/seller", {
            name: formData.username,
            email: formData.email,
            phone: formData.phone || "",
            address: formData.address || "",
            password: formData.password,
            userId: editingUser.id,
          })
          toast.success(t("userUpdatedSellerCreated"))
        } else {
          // Regular user update using PATCH /users
          await axiosPrivate.patch("/users", {
            username: formData.username,
            email: formData.email,
          })
          toast.success(t("userUpdated"))
        }
        await fetchUsers() // Refresh the list
      } else {
        // Creating new user
        if (formData.role === "TOURIST") {
          // Sign up as normal tourist
          await axiosPrivate.post("/auth/signup", {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          })
          toast.success(t("touristCreated"))
        } else if (formData.role === "VENDEUR") {
          // Sign up first, then create seller profile
          const signupResponse = await axiosPrivate.post("/auth/signup", {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          })

          // Extract user ID from response (adjust based on your API response structure)
          const userId = signupResponse.data.user?.id || signupResponse.data.id

          if (userId) {
            await axiosPrivate.post("/seller", {
              name: formData.username,
              email: formData.email,
              phone: formData.phone || "",
              address: formData.address || "",
              password: formData.password,
              userId: userId,
            })
            toast.success(t("sellerCreated"))
          } else {
            toast.error(t("errorCreatingSellerProfile"))
          }
        } else {
          // For admin/guide roles, would need special endpoint
          await axiosPrivate.post("/auth/signup", {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          })
          toast.success(t("userCreated", { role: formData.role }))
        }
        await fetchUsers() // Refresh the list
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      console.log("Error saving user:", error)
      const message = error.response?.data?.message || t("errorSaving")
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      // Would need a delete user endpoint
      await axiosPrivate.delete(`/users/${userId}`)
      toast.success(t("userDeleted"))
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.log("Error deleting user:", error)
      toast.error(t("errorDeleting"))
    }
  }

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getUserStats = () => {
    const totalUsers = users.length
    const adminCount = users.filter((u: User) => u.role === "ADMIN").length
    const guideCount = users.filter((u: User) => u.role === "GUIDE").length
    const sellerCount = users.filter((u: User) => u.role === "VENDEUR").length
    const touristCount = users.filter((u: User) => u.role === "TOURIST").length

    return { totalUsers, adminCount, guideCount, sellerCount, touristCount }
  }

  const stats = getUserStats()

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200 transition-colors">
            <Crown className="h-3 w-3 mr-1" />
            {t("administrator")}
          </Badge>
        )
      case "GUIDE":
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 transition-colors">
            <MapPin className="h-3 w-3 mr-1" />
            {t("guide")}
          </Badge>
        )
      case "VENDEUR":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors">
            <UserCheck className="h-3 w-3 mr-1" />
            {t("seller")}
          </Badge>
        )
      case "TOURIST":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 transition-colors">
            <Users className="h-3 w-3 mr-1" />
            {t("tourist")}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 transition-colors">
            <Users className="h-3 w-3 mr-1" />
            {role}
          </Badge>
        )
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "from-red-500 to-red-600"
      case "GUIDE":
        return "from-orange-500 to-orange-600"
      case "VENDEUR":
        return "from-green-500 to-green-600"
      case "TOURIST":
        return "from-purple-500 to-purple-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <ContentCard className="group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">{trend}</span>
              <span className="text-sm text-gray-500">{t("vsLastMonth")}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            `bg-gradient-to-br ${color} shadow-lg group-hover:shadow-xl transition-all duration-300`,
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </ContentCard>
  )

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-lg text-gray-600">{t("subtitle")}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title={t("totalUsers")}
          value={loading ? "..." : stats.totalUsers.toString()}
          icon={Users}
          trend="+12%"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title={t("administrators")}
          value={loading ? "..." : stats.adminCount.toString()}
          icon={Crown}
          trend="+2%"
          color="from-red-500 to-red-600"
        />
        <StatCard
          title={t("guides")}
          value={loading ? "..." : stats.guideCount.toString()}
          icon={MapPin}
          trend="+8%"
          color="from-orange-500 to-orange-600"
        />
        <StatCard
          title={t("sellers")}
          value={loading ? "..." : stats.sellerCount.toString()}
          icon={UserCheck}
          trend="+15%"
          color="from-green-500 to-green-600"
        />
        <StatCard
          title={t("tourists")}
          value={loading ? "..." : stats.touristCount.toString()}
          icon={Users}
          trend="+25%"
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Users Management */}
      <ContentCard className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t("systemUsers")}</h3>
            <p className="text-sm text-gray-600">{t("manageUserAccounts")}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("searchUsers")}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Select value={filterRole} onValueChange={(value) => setFilterRole(value as ExtendedUserRole | "all")}>
                <SelectTrigger className="pl-10 bg-gray-50 border-gray-200">
                  <SelectValue placeholder={t("filterByRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allRoles")}</SelectItem>
                  <SelectItem value="ADMIN">{t("administrator")}</SelectItem>
                  <SelectItem value="GUIDE">{t("guide")}</SelectItem>
                  <SelectItem value="VENDEUR">{t("seller")}</SelectItem>
                  <SelectItem value="TOURIST">{t("tourist")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add User Button */}
            <Button
              onClick={handleAddUser}
              className="bg-gradient-to-r from-[#FEAC19] to-orange-500 hover:from-[#FEAC19]/90 hover:to-orange-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("addUser")}
            </Button>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#FEAC19] mx-auto" />
              <p className="text-gray-600">{t("loadingUsers")}</p>
            </div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user: User) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-[#FEAC19]/30 hover:shadow-lg transition-all duration-300 overflow-hidden group p-6"
              >
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        `bg-gradient-to-br ${getRoleColor(user.role)} shadow-lg`,
                      )}
                    >
                      <span className="text-white font-bold text-lg">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-[#FEAC19] transition-colors">
                        {user.username}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Role */}
                <div className="mb-4">{getRoleBadge(user.role)}</div>

                {/* User Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">ID: {user.id}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                      className="hover:bg-[#FEAC19]/10 hover:border-[#FEAC19]/30 hover:text-[#FEAC19]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.id !== 1 && ( // Don't allow deleting the main admin
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t("noUsersFound")}</p>
            <p className="text-gray-500 text-sm">{t("adjustSearchCriteria")}</p>
          </div>
        )}
      </ContentCard>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{editingUser ? t("editUser") : t("newUser")}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingUser ? t("updateUserInfo") : t("createNewUser")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">
                {t("username")}
              </Label>
              <Input
                id="username"
                placeholder={t("enterUsername")}
                className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                {t("emailAddress")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("enterEmail")}
                className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">
                {t("role")}
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as ExtendedUserRole })}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder={t("selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TOURIST">{t("touristAccess")}</SelectItem>
                  <SelectItem value="VENDEUR">{t("sellerAccess")}</SelectItem>
                  <SelectItem value="GUIDE">{t("guideAccess")}</SelectItem>
                  <SelectItem value="ADMIN">{t("adminAccess")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show additional fields for sellers */}
            {formData.role === "VENDEUR" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    {t("phone")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("phoneNumber")}
                    className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700">
                    {t("address")}
                  </Label>
                  <Input
                    id="address"
                    placeholder={t("fullAddress")}
                    className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </>
            )}

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  {t("password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("enterPassword")}
                  className="bg-gray-50 border-gray-200 focus:border-[#FEAC19] focus:ring-[#FEAC19]/20"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-200 hover:bg-gray-50"
              disabled={submitting}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={!formData.username || !formData.email || (!editingUser && !formData.password) || submitting}
              className="bg-gradient-to-r from-[#FEAC19] to-orange-500 hover:from-[#FEAC19]/90 hover:to-orange-500/90 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingUser ? t("updating") : t("creating")}
                </>
              ) : (
                <>{editingUser ? t("updateUser") : t("addUser")}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
