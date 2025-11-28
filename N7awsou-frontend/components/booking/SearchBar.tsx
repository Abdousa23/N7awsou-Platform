'use client';

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange?: (value: string) => void;
    onToggleFilters?: () => void;
    onSearch?: () => void;
    className?: string;
}

export default function SearchBar({
    searchQuery,
    onSearchChange,
    onToggleFilters,
    onSearch,
    className = ""
}: SearchBarProps) {
    const t = useTranslations('booking.searchBar');
    return (
        <div className={`max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-xl ${className}`}>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder={t('placeholder')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="pl-10 bg-white border-gray-300 text-gray-800 placeholder-gray-500 h-12 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                    />
                </div>
                <Button
                    onClick={onToggleFilters}
                    variant="outline"
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-6"
                >
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    {t('filters')}
                </Button>
                <Button
                    onClick={onSearch}
                    className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold h-12 px-8"
                >
                    <Search className="w-5 h-5 mr-2" />
                    {t('search')}
                </Button>
            </div>
        </div>
    );
}
