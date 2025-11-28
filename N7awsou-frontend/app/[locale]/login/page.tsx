"use client"

import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import PageLayout from "@/components/layout/PageLayout"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Link } from "@/i18n/navigation"
import useAuthStore from "@/store/store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Role } from "@/types"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  const t = useTranslations("auth.login")
  const tValidation = useTranslations("auth.validation")

  useEffect(() => {
    clearError()
  }, [clearError])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  })

  const watchedEmail = watch("email")
  const watchedPassword = watch("password")

  const onSubmit = async (data: LoginFormData) => {
    setIsFormSubmitted(true)
    const { rememberMe, ...credentials } = data

    try {
      await login(credentials)

      // Only redirect if login was successful
      const state = useAuthStore.getState()
      if (state.isAuthenticated && state.user) {
        const user = state.user
        console.log("Logged in user:", user)

        // Redirect based on user role
        if (user.role === Role.ADMIN) {
          router.push("/dashboard")
        } else if (user.role === Role.GUIDE) {
          router.push("/guide")
        } else {
          router.push("/booking")
        }
      }
    } catch (err) {
      // Error is already set in the store, just show toast
      console.error("Login error:", err)
    } finally {
      setIsFormSubmitted(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <PageLayout>
      <div className="min-h-screen flex p-4 lg:p-6 bg-gray-100">
        <div className="w-full flex rounded-3xl overflow-hidden shadow-2xl bg-white">
          {/* Left side */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 to-orange-500 relative overflow-hidden rounded-l-3xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                width={500}
                height={500}
                src="/Screenshot_2025-06-27_123507-removebg-preview.png"
                alt="Travel Bus"
                className="w-80 h-80 object-contain opacity-90"
              />
            </div>
            <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute bottom-32 left-16 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/10 rounded-full" />
          </div>

          {/* Right side (form) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-50 lg:rounded-r-3xl">
            <div className="w-full max-w-md">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{t("title")}</h1>
                <h2 className="text-3xl font-bold text-gray-900">{t("subtitle")}</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="sr-only">
                    {t("email_placeholder")}
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    id="email"
                    aria-invalid={!!errors.email}
                    placeholder={t("email_placeholder")}
                    className="w-full h-10 sm:h-12 px-4 border-0 border-b-2 border-gray-300 bg-transparent rounded-none focus:border-orange-400 focus:ring-0 placeholder-gray-500 text-gray-900 text-sm sm:text-base transition-colors duration-200"
                  />
                  {errors.email && <p className="text-xs sm:text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="sr-only">
                    {t("password_placeholder")}
                  </label>
                  <div className="relative">
                    <Input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      aria-invalid={!!errors.password}
                      placeholder={t("password_placeholder")}
                      className="w-full h-10 sm:h-12 px-4 pr-12 border-0 border-b-2 border-gray-300 bg-transparent rounded-none focus:border-orange-400 focus:ring-0 placeholder-gray-500 text-gray-900 text-sm sm:text-base transition-colors duration-200"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs sm:text-sm text-red-600">{errors.password.message}</p>}
                </div>

                {/* Remember Me & Forgot */}
                <div className="flex items-center justify-between pt-2 sm:pt-4">
                  <div className="flex items-center">
                    <input
                      {...register("rememberMe")}
                      type="checkbox"
                      id="rememberme"
                      className="h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-300 rounded"
                    />
                    <label htmlFor="rememberme" className="ml-2 text-xs sm:text-sm text-gray-600">
                      {t("remember_me")}
                    </label>
                  </div>
                  <Link
                    href="/forgetpassword"
                    className="text-xs sm:text-sm text-orange-400 hover:text-orange-500 transition-colors"
                  >
                    {t("forgot_password")}
                  </Link>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className={`w-full h-10 sm:h-12 font-semibold rounded-full transition-all duration-300 text-sm sm:text-base ${isLoading || !isValid
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-900 active:bg-gray-700"
                    } text-white mt-6 sm:mt-8`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{t("signing_in")}</span>
                    </div>
                  ) : (
                    t("sign_in")
                  )}
                </Button>
              </form>

              {/* OR Divider */}
              <div className="relative mt-6 sm:mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500 font-medium">{t("or")}</span>
                </div>
              </div>

              {/* Sign Up */}
              <div className="text-center mt-6 sm:mt-8">
                <p className="text-gray-600 text-sm sm:text-base">
                  {t("no_account")}{" "}
                  <Link
                    href="/register"
                    className="text-orange-400 hover:text-orange-500 font-medium transition-colors"
                  >
                    {t("sign_up")}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile-only background */}
          <div className="lg:hidden fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-200/20 rounded-full"></div>
            <div className="absolute top-1/3 -left-10 w-20 h-20 bg-orange-300/20 rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-16 h-16 bg-orange-400/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
