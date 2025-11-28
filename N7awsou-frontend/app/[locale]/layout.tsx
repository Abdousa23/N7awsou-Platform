import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import AuthProvider from "@/components/AuthProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "N7awsou Travel",
    description: "Your travel companion for exploring the world",
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Await params before destructuring
    const { locale } = await params;
    
    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextIntlClientProvider messages={messages}>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
