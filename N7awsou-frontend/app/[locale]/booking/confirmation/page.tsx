'use client';

import { axiosPrivate } from '@/api/axios';
import { useSearchParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useAuthStore from '@/store/store';

type Props = {}

const page = (props: Props) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderNum = searchParams.get('order_number');
    console.log("searchParams:", searchParams);
    console.log('Order Number:', orderNum);
    const {accessToken} = useAuthStore();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);

    const confirmPayment = async () => {
        
        try {
            setLoading(true);
            setError(null);
            if(!accessToken){
                setTimeout(() => {
                }, 1000);
                return;
            }
            const response = await axiosPrivate.put(`/payments/update-transaction/${orderNum}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.status === 200) {
                // Handle successful confirmation
                console.log('Payment confirmed:', response.data);
                setSuccess(true);
                setLoading(false);
                
                // Redirect after 3 seconds to show success message
                router.push('/booking');
            } else {
                // Handle unexpected response status
                setError('Réponse inattendue du serveur');
                setLoading(false);
            }

        } catch (error: any) {
            console.error('Payment confirmation error:', error);
            setError(error.response?.data?.message || 'Erreur lors de la confirmation du paiement');
            setLoading(false);
        }
    }

    // Automatically confirm payment when component mounts
    useEffect(() => {
        if (orderNum) {
            confirmPayment();
        } else {
            setError('Numéro de commande manquant dans l\'URL');
            setLoading(false);
        }
    }, [orderNum , accessToken]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <CreditCard className="h-6 w-6 text-[#FEAC19]" />
                        Confirmation de Paiement
                    </CardTitle>
                    <CardDescription>
                        Commande #{orderNum || 'Non spécifiée'}
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center space-y-6">
                    {loading && (
                        <>
                            <div className="flex justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-[#FEAC19]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Confirmation en cours...
                                </h3>
                                <p className="text-gray-600">
                                    Nous confirmons votre paiement. Veuillez patienter quelques instants.
                                </p>
                            </div>
                        </>
                    )}

                    {success && !loading && (
                        <>
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-700 mb-2">
                                    Paiement Confirmé !
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Votre paiement a été traité avec succès. Vous allez être redirigé vers vos réservations.
                                </p>
                                <div className="text-sm text-gray-500">
                                    Redirection automatique dans 3 secondes...
                                </div>
                            </div>
                        </>
                    )}

                    {error && !loading && (
                        <>
                            <div className="flex justify-center">
                                <XCircle className="h-12 w-12 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-700 mb-2">
                                    Erreur de Confirmation
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {error}
                                </p>
                                <div className="space-y-2">
                                    <Button 
                                        onClick={confirmPayment}
                                        className="w-full bg-[#FEAC19] hover:bg-[#FEAC19]/90"
                                    >
                                        Réessayer
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => router.push('/booking')}
                                        className="w-full"
                                    >
                                        Retour aux Réservations
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default page
