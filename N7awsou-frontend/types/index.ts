export enum Priority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low"
}

export enum StatusEnum {
  COMPLETED = "Completed",
  INPROGRES = "In progres",
  PENDING = "Pending",
}

// Tour/Travel Package related types that match backend schema
export enum TripType {
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
  LUXURY = "LUXURY",
  CUSTOM = "CUSTOM",
}

export enum PaymentStatus {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

export enum Role {
  TOURIST = "TOURIST",
  GUIDE = "GUIDE",
  ADMIN = "ADMIN",
  VENDEUR = "VENDEUR"
}

// JWT Payload interface
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role?: string;
  iat: number; // Issued at
  exp: number; // Expiration time
}

// Main Tour interface matching backend Tour model
export interface Tour {
  id: number;
  name: string;
  description: string;
  price: number;
  departureDate: string; // ISO date string
  returnDate: string;    // ISO date string
  departureLocation: string;
  destinationLocation: string;
  includedFeatures: string[];
  category?: string;
  tripType: TripType;
  images: string[];
  dressCode?: string;
  available: boolean;
  duration: number; // in days
  availableCapacity: number;
  maxCapacity: number; // Add maxCapacity field
  createdAt: string;
  updatedAt: string;
  sellerId?: number;
  Rating: number; // average rating
}

// For creating/updating tours (without auto-generated fields)
export interface CreateTourDto {
  name: string;
  description: string;
  price: number;
  departureDate: string;
  returnDate: string;
  departureLocation: string;
  destinationLocation: string;
  includedFeatures: string[];
  category?: string;
  tripType: TripType;
  images: string[];
  dressCode?: string;
  available?: boolean;
  duration: number;
  availableCapacity?: number;
  maxCapacity?: number; // Add maxCapacity field
  sellerId?: number;
}

export interface UpdateTourDto extends Partial<CreateTourDto> {
  id: number;
}

export interface TourFilterDto {
  destinationLocation?: string
  availability?: boolean
}

// Payment interface
export interface Payment {
  id: number;
  userId: number;
  tourId: number;
  amount: number;
  numberOfPeople: number;
  currency: string;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  processedAt?: string;
  failedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  notes?: string;
}

// Review interface
export interface Review {
  id: number;
  rating: number;
  review?: string;
  userId: number;
  tourId: number;
}


export type UserRole = "admin" | "seller" | "manager";


// Seller interface
export interface Seller {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

// User interface (basic)
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  role: Role;
}

// For backward compatibility, alias Tour as TravelPackage
export type TravelPackage = Tour;
