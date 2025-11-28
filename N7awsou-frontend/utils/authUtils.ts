import axios from "@/api/axios";
import useAuthStore from '@/store/store';
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@/type";
/**
 * Checks if the user has a valid refresh token cookie
 * and attempts to get a new access token on app load
 * 
 * @returns Promise<boolean> - Whether the user is authenticated
 */
export async function checkAuthStatus(): Promise<boolean> {
    try {
        // Make a request to the refresh endpoint - the server will check the HTTP-only cookie
        const response = await axios.post('/auth/refresh');
        const { accessToken } = response.data;

        if (!accessToken) return false;

        // Decode the new access token to get user info
        const decodedToken = jwtDecode<JwtPayload>(accessToken);

        // Fetch user details
        const userResponse = await axios.get(`/users/profile`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Update the auth store with the new access token and user info
        useAuthStore.setState({
            user: userResponse.data,
            accessToken: accessToken,
            isAuthenticated: true
        });
        localStorage.setItem("isAuthenticated", 'true');



        return true;
    } catch (error) {
        // If any error occurs during refresh, the user is not authenticated
        useAuthStore.getState().logout();
        return false;
    }
}

/**
 * Setup auth state for Next.js app on initial load
 */
export function setupAuth() {

    if (typeof window !== "undefined") {
        // Check auth status when the app loads
        checkAuthStatus().catch(console.log);
    }
}