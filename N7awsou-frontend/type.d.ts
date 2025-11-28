export type User = {
    id?: number,
    fullName: string,
    email: string,
    password?: string,
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isSlow: boolean; // Added missing property

    // Actions
    register: (userData: { fullName: string; email: string; password: string }) => Promise<void>;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokens: () => Promise<boolean>;
    clearError: () => void;
    getAccessToken: () => Promise<string | null>;
    testInternetSpeed: () => Promise<void>; // Added missing method
}

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

// Define the JWT payload structure
interface JwtPayload {
    sub: number; // user id
    email: string;
    exp: number; // expiration timestamp
}


export enum StatusEnum {
    COMPLETED = "Completed",
    INPROGRES = "In progres",
    PENDING = "Pending",
}

export enum Priority {
    HIGH = "High",
    MEDIUM = "Medium",
    LOW = "Low"
}