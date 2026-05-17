import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workout Tracker",
  description: "Track your workouts and progress.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Workout Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
