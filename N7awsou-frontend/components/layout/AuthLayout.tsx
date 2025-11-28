import React from 'react';
import Image from 'next/image';
import PageLayout from './PageLayout';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    imageSrc: string;
    imageAlt: string;
    heroTitle: string;
    heroSubtitle: string;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    imageSrc,
    imageAlt,
    heroTitle,
    heroSubtitle
}: AuthLayoutProps) {
    return (
        <PageLayout>
            <main className="min-h-screen flex">
                {/* Left Hero Section */}
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-[#FEAC19] via-[#f5a623] to-[#e59a16]">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-20 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl"></div>
                        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white bg-opacity-15 rounded-full blur-lg"></div>
                        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white bg-opacity-20 rounded-full blur-md"></div>
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-10 text-center text-black px-8">
                        <div className="mb-8">
                            <Image
                                src={imageSrc}
                                width={400}
                                height={300}
                                alt={imageAlt}
                                className="w-full max-w-md h-auto drop-shadow-2xl"
                            />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 leading-tight">
                            {heroTitle}
                        </h1>
                        <p className="text-xl text-black text-opacity-90 max-w-md mx-auto">
                            {heroSubtitle}
                        </p>
                    </div>
                </div>

                {/* Right Form Section */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                {title}
                            </h2>
                            <p className="text-gray-600">
                                {subtitle}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </main>
        </PageLayout>
    );
}
