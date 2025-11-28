'use client';

import { useEffect } from 'react';
import useAxiosPrivate from './useAxiosPrivate';

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    emailVerified: boolean;
    emailSubscribed: boolean;
    role: string;
    createdAt: string;
    unsubscribedAt?: string;
    lastEmailSent?: string;
}

export interface Reservation {
    id: number;
    amount: number;
    numberOfPeople: number;
    currency: string;
    status: string;
    createdAt: string;
    processedAt?: string;
    tour: {
        id: number;
        name: string;
        description: string;
        price: number;
        departureDate: string;
        returnDate: string;
        departureLocation: string;
        destinationLocation: string;
        images: string[];
        duration: number;
        tripType: string;
    };
}

export const useUserProfile = () => {
    const axiosPrivate = useAxiosPrivate();

    const fetchUserProfile = async (): Promise<UserProfile> => {
        const response = await axiosPrivate.get('/users/profile');
        return response.data;
    };

    const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await axiosPrivate.patch('/users', data);
        return response.data;
    };

    const fetchUserReservations = async (): Promise<Reservation[]> => {
        const response = await axiosPrivate.get('/payments/my');
        return response.data;
    };

    return {
        fetchUserProfile,
        updateUserProfile,
        fetchUserReservations,
    };
};
