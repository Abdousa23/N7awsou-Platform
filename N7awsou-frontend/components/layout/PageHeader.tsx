import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    gradient?: boolean;
    className?: string;
}

export default function PageHeader({
    title,
    subtitle,
    gradient = true,
    className = ""
}: PageHeaderProps) {
    return (
        <div className={`text-center py-16 px-4 ${className}`}>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${gradient
                    ? "bg-gradient-to-r from-[#FEAC19] via-orange-400 to-yellow-400 bg-clip-text text-transparent"
                    : "text-gray-800"
                }`}>
                {title}
            </h1>
            {subtitle && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
