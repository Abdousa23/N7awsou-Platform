import { useEffect } from "react";
import { axiosPrivate } from "@/api/axios";
import useAuthStore from "@/store/store";

const useAxiosPrivate = () => {
    const { accessToken, getAccessToken, refreshTokens, logout } = useAuthStore();


    // Ensure the access token is available before setting up interceptors
    useEffect(() => {
        if (!accessToken) {
            console.warn("No access token available. Axios private instance will not be set up.");
            console.log(accessToken)
            getAccessToken(); // Ensure we have a valid token
        }
    }, [accessToken]);
    useEffect(() => {
        // Request interceptor to add Authorization header
        const requestInterceptor = axiosPrivate.interceptors.request.use(
            async (config) => {
                // Only add auth header if it's not already present
                if (!config.headers.Authorization && !config.headers.authorization) {
                    // Get a valid access token (this will refresh if needed)
                    const validToken = await getAccessToken();
                    
                    if (validToken) {
                        config.headers['Authorization'] = `Bearer ${validToken}`;
                        config.headers['authorization'] = `Bearer ${validToken}`;
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor to handle token refresh
        const responseInterceptor = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;
                
                // Handle 401/403 errors for token refresh
                if ((error.response?.status === 401 || error.response?.status === 403) && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    
                    try {
                        // Try to refresh the token
                        const refreshSuccess = await refreshTokens();
                        
                        if (refreshSuccess) {
                            // Get the new access token and retry the request
                            const newAccessToken = await getAccessToken();
                            if (newAccessToken) {
                                prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                                prevRequest.headers['authorization'] = `Bearer ${newAccessToken}`;
                                return axiosPrivate.request(prevRequest);
                            }
                        }
                        
                        // If refresh failed, logout
                        logout();
                        return Promise.reject(error);
                    } catch (refreshError) {
                        // If refresh threw an error, logout
                        logout();
                        return Promise.reject(refreshError);
                    }
                }
                
                return Promise.reject(error);
            }
        );

        // Cleanup function to remove interceptors when component unmounts
        return () => {
            axiosPrivate.interceptors.request.eject(requestInterceptor);
            axiosPrivate.interceptors.response.eject(responseInterceptor);
        };
    }, [accessToken, getAccessToken, refreshTokens, logout]);

    return axiosPrivate;
};

export default useAxiosPrivate;