"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Inter } from "next/font/google"
import { useTranslations } from "next-intl"

import useAuthStore from "@/store/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PageLayout from "@/components/layout/PageLayout"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "800"],
})

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading, error, isAuthenticated, clearError } = useAuthStore()
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const t = useTranslations("auth.register")
  const tValidation = useTranslations("auth.validation")

  useEffect(() => {
    clearError()
  }, [clearError])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onChange",
  })

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, acceptTerms, ...user } = data
    const userToRegister = {
      username: user.fullName,
      email: user.email,
      password: user.password,
    }

    try {
      await registerUser(userToRegister)

      // Only show success if registration was successful (no error in store)
      const state = useAuthStore.getState()
      if (!state.error) {
        setSubmitSuccess(true)
        reset()
        toast.success(t("success"))
      }
    } catch (err) {
      // Error is already set in the store and displayed in the form
      console.error("Registration error:", err)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev)
  }

  if (submitSuccess) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center py-8">
              <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-2xl">
                <p className="text-green-600 font-semibold text-lg">{t("success")}</p>
                <p className="text-green-600 text-sm mt-2">{t("success_message")}</p>
              </div>
              <Link href="/login">
                <Button className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-full transition-all duration-300">
                  {t("go_to_sign_in")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="min-h-screen flex p-4 lg:p-6 bg-gray-100">
        <div className="w-full flex rounded-3xl overflow-hidden shadow-2xl bg-white">
          {/* Left side */}
          <div className="hidden lg:flex lg:w-1/2 bg-[#101010] relative overflow-hidden rounded-l-3xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full bg-[#FEAC19]"
                style={{
                  width: "300px",
                  height: "300px",
                  filter: "blur(60px)",
                  opacity: ".3",
                }}
              ></div>
              <Image
                width={250}
                height={250}
                src="/bus.png"
                alt="Travel Adventure"
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
              <div className={`mb-6 sm:mb-8${inter.className}`}>
                <h1 className={`text-3xl font-bold text-gray-900 mb-1 `}>{t("title")}</h1>
                <h2 className="text-3xl font-bold text-gray-900">{t("subtitle")}</h2>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="sr-only">
                    {t("full_name")}
                  </label>
                  <Input
                    {...register("fullName")}
                    type="text"
                    id="fullName"
                    aria-invalid={!!errors.fullName}
                    placeholder={t("full_name")}
                    className="w-full h-10 sm:h-12 px-4 border-0 border-b-2 border-gray-300 bg-transparent rounded-none focus:border-orange-400 focus:ring-0 placeholder-gray-500 text-gray-900 text-sm sm:text-base transition-colors duration-200"
                  />
                  {errors.fullName && <p className="text-xs sm:text-sm text-red-600">{errors.fullName.message}</p>}
                </div>

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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="sr-only">
                    {t("confirm_password")}
                  </label>
                  <div className="relative">
                    <Input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      aria-invalid={!!errors.confirmPassword}
                      placeholder={t("confirm_password")}
                      className="w-full h-10 sm:h-12 px-4 pr-12 border-0 border-b-2 border-gray-300 bg-transparent rounded-none focus:border-orange-400 focus:ring-0 placeholder-gray-500 text-gray-900 text-sm sm:text-base transition-colors duration-200"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs sm:text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start pt-2 sm:pt-4">
                  <input
                    {...register("acceptTerms")}
                    type="checkbox"
                    id="acceptTerms"
                    className="h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="acceptTerms" className="ml-2 text-xs sm:text-sm text-gray-600">
                    {t("accept_terms")}{" "}
                    <Link href="/terms" className="text-orange-400 hover:text-orange-500 font-medium transition-colors">
                      {t("terms_and_conditions")}
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-orange-400 hover:text-orange-500 font-medium transition-colors"
                    >
                      {t("privacy_policy")}
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-xs sm:text-sm text-red-600">{errors.acceptTerms.message}</p>}

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
                      <span>{t("creating_account")}</span>
                    </div>
                  ) : (
                    t("create_account")
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

              {/* Sign In */}
              <div className="text-center mt-6 sm:mt-8">
                <p className="text-gray-600 text-sm sm:text-base">
                  {t("have_account")}{" "}
                  <Link href="/login" className="text-orange-400 hover:text-orange-500 font-medium transition-colors">
                    {t("sign_in")}
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
