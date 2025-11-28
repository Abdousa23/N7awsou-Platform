import React from 'react';

interface PageLayoutProps {
    children: React.ReactNode;
    showBackgroundEffects?: boolean;
    className?: string;
}

export default function PageLayout({
    children,
    showBackgroundEffects = true,
    className = ""
}: PageLayoutProps) {
    return (
        <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 ${className}`}>
            {/* Background Effects */}
            {showBackgroundEffects && (
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FEAC19] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                </div>
            )}

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
