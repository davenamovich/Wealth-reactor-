import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config";
import { Suspense } from "react";
import BottomNav from "@/components/BottomNav";
import dynamic from "next/dynamic";

const Web3Provider = dynamic(
  () => import("@/components/Web3Provider").then((mod) => mod.Web3Provider),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.tagline,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Web3Provider>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <div className="pb-20">
              {children}
            </div>
            <BottomNav />
          </Suspense>
        </Web3Provider>
      </body>
    </html>
  );
}
