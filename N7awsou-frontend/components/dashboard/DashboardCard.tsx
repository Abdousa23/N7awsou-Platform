'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
}

export default function DashboardCard({
    title,
    value,
    icon: Icon,
    trend,
    className = ""
}: DashboardCardProps) {
    return (
        <Card className={`bg-white/90 backdrop-blur-md border-gray-200 hover:shadow-lg transition-all duration-300 ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-[#FEAC19]" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-800">{value}</div>
                {trend && (
                    <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'} mt-1`}>
                        {trend.isPositive ? '+' : ''}{trend.value}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
