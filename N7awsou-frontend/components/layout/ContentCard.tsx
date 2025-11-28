import React from 'react';

interface ContentCardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export default function ContentCard({
    children,
    className = "",
    noPadding = false
}: ContentCardProps) {
    return (
        <div className={`bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 ${noPadding ? '' : 'p-6'
            } ${className}`}>
            {children}
        </div>
    );
}
