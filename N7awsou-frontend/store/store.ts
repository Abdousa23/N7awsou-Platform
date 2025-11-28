import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types';
import axios, { axiosPrivate } from '@/api/axios';
import { AxiosError } from 'axios';

// Define types for the auth store
export interface User {
    id: string;
    username?: string;
    email: string;
    fullName?: string;
    role?: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isSlow: boolean;
    role: string | null;

    // Actions
    testInternetSpeed: () => Promise<void>;
    register: (userData: any) => Promise<void>;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokens: () => Promise<boolean>;
    getAccessToken: () => Promise<string | null>;
    clearError: () => void;
}

// Define the auth store state - Notice we're not using persist middleware anymore
const useAuthStore = create<AuthState>((set, get) => ({
    // Initial state
    user: null,
    accessToken: null, // Only stored in memory now
    refreshToken: null, // Not actually stored, just for type compatibility
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isSlow: false,
    role: null,


    //test network speed
    testInternetSpeed: async () => {
        const googleStart = performance.now()
        try {
            await fetch('https://www.google.com/generate_204', {
                mode: 'no-cors',
                cache: 'no-cache',
            })

            const googleDuration = performance.now() - googleStart

            if (googleDuration > 5) {
                console.log("there's an error by our side")
            }
            else {
                console.log("please check  your internet connexion")
            }

        }
        catch (error) {
            console.log(error)
        }
    },

    // Register action
    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/auth/signup', userData);

            // Token will be set as HTTP-only cookie by the server
            const tokens = response.data;

            // Decode the JWT to get user information
            const decodedToken = jwtDecode<JwtPayload>(tokens.accessToken);

            // Set user and access token in memory
            set({
                accessToken: tokens.accessToken,
                refreshToken: null, // We don't store this in state anymore
                isAuthenticated: true,
                isLoading: false,
                role: decodedToken.role || null, // Extract role from token
                // Create a user object from the token payload
                user: {
                    id: decodedToken.sub,
                    email: decodedToken.email,
                    fullName: userData.fullName,
                },
            });
        } catch (error) {
            console.log('Registration error:', error);
            const axiosError = error as AxiosError<{ message: string }>;
            set({
                error: axiosError.response?.data?.message || 'Registration failed',
                isLoading: false,
            });
        }
    },

    // Login action
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        const startTime = performance.now()
        const slowTimer = setTimeout(() => {
            console.log("this may take a little while longer")
            set({ isSlow: true });
            get().testInternetSpeed();
        }, 5000)
        try {
            const response = await axios.post('/auth/signin', credentials);

            // Refresh token will be set as HTTP-only cookie by the server
            const tokens = response.data;

            // Decode the JWT to get user information
            const decodedToken = jwtDecode<JwtPayload>(tokens.accessToken);

            // Fetch user details if needed (or extract from token)
            const userResponse = await axiosPrivate.get(`/users/profile`, {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                },
            });

            const userData = userResponse.data;

            set({
                accessToken: tokens.accessToken,
                isAuthenticated: true,
                isLoading: false,
                user: userData,
                role: decodedToken.role || null, // Extract role from token
            });
            console.log("ggggggg", userData
                , userResponse
            )
            localStorage.setItem("accessToken", tokens.accessToken);
            localStorage.setItem("isAuthenticated", 'true');
            localStorage.setItem("userId", userData.id);
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            console.log('Registration error:', error);


            set({
                error: axiosError.response?.data?.message || 'Login failed',
                isLoading: false,
            });
        }
        finally {
            clearTimeout(slowTimer)
            console.log("total duration : ", performance.now() - startTime)
        }
    },

    // Logout action
    logout: async () => {
        set({ isLoading: true });
        try {
            // Get the user ID before logging out
            const { user } = get();

            if (user && user.id) {
                // Call logout endpoint - this should clear the HTTP-only cookie on server
                await axiosPrivate.post(`/auth/logout`, {}, {
                    headers: {
                        Authorization: `Bearer ${get().accessToken}`,
                    },
                });
            }

            // Clear state regardless of API response
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                role: null,
            });
            localStorage.removeItem("isAuthenticated")
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userId");
        } catch (error) {
            console.log('Logout error:', error);
            // Still clear state even if API call fails
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                role: null,
            });
        }
    },

    // Refresh tokens action
    refreshTokens: async () => {
        const { user } = get();

        if (!user || !user.id) return false;

        try {
            // The refresh token is automatically sent as cookie
            const response = await axios.post(`/auth/refresh/`);
            const tokens = response.data;

            // Update the access token in memory
            set({ accessToken: tokens.accessToken });

            return true;
        } catch (error) {
            console.log('Token refresh error:', error);
            // If refresh fails, log the user out
            get().logout();
            return false;
        }
    },

    // Get a valid access token (refreshing if needed)
    getAccessToken: async () => {
        const { accessToken } = get();

        if (!accessToken) return null;

        // Check if token is expired
        try {
            const decodedToken = jwtDecode<JwtPayload>(accessToken);
            const currentTime = Math.floor(Date.now() / 1000);

            // If token is expired or about to expire (within 1 minute), refresh it
            if (decodedToken.exp <= currentTime + 60) {
                const refreshSuccess = await get().refreshTokens();
                if (!refreshSuccess) return null;
                return get().accessToken;
            }

            return accessToken;
        } catch (error) {
            console.log('Token decode error:', error);
            return null;
        }
    },

    // Utility to clear error messages
    clearError: () => set({ error: null }),
}));

export default useAuthStore;