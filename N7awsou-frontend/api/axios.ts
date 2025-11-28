import axios from "axios"
import useAuthStore from "@/store/store"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Important for sending/receiving cookies
})

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Important for sending/receiving cookies
})

// Request interceptor for adding the auth token
axiosPrivate.interceptors.request.use(
  async (config) => {
    // Get the current access token from the store
    const accessToken = (await localStorage.getItem("accessToken")) || useAuthStore.getState().accessToken
    console.log(accessToken, "access token from local storage")
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    console.log("Request config:", config.headers.Authorization)
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for handling token refresh
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 Unauthorized and we haven't tried to refresh already
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token - this will use the HTTP-only cookie
        const refreshSuccess = await useAuthStore.getState().refreshTokens()

        if (refreshSuccess) {
          // If refresh was successful, update the auth header and retry
          const accessToken = useAuthStore.getState().accessToken
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return axiosPrivate(originalRequest)
        }

        // If refresh failed, logout and redirect to login
        useAuthStore.getState().logout()
        return Promise.reject(error)
      } catch (refreshError) {
        // If there was an error refreshing, logout
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
