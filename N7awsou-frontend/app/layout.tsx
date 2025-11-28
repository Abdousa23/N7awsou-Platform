import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "N7awsou Travel",
  description: "Your travel companion for exploring the world",
    generator: 'v0.dev'
};

// Since we have a `not-found.tsx` file on the root level,
// a layout file is required, even if it's just passing children through.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}


import './globals.css'
