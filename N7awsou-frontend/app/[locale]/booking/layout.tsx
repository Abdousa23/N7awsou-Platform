import AuthProvider from '@/components/AuthProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Booking - N7awsou Travel',
    description: 'Book your perfect travel adventure with N7awsou. Discover amazing destinations and create unforgettable memories.',
    keywords: ['travel booking', 'tours', 'adventures', 'travel packages', 'N7awsou'],
    openGraph: {
        title: 'Booking - N7awsou Travel',
        description: 'Book your perfect travel adventure with N7awsou. Discover amazing destinations and create unforgettable memories.',
        type: 'website',
        locale: 'en_US',
        siteName: 'N7awsou Travel',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Booking - N7awsou Travel',
        description: 'Book your perfect travel adventure with N7awsou. Discover amazing destinations and create unforgettable memories.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

interface BookingLayoutProps {
    children: React.ReactNode;
}

export default function BookingLayout({ children }: BookingLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Background Effects */}
            <div className="fixed inset-0 opacity-40 pointer-events-none">
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FEAC19] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <AuthProvider>{children}</AuthProvider>
            </div>
        </div>
    );
}
