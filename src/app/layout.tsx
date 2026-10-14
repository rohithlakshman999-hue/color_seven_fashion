import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import CartDrawer from "@/components/CartDrawer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import LiveReviewNotificationPopup from "@/components/LiveReviewNotificationPopup";

export const metadata: Metadata = {
  title: "COLOUR SEVEN FASHION",
  description: "Premium modern streetwear, watches, shoes & accessories — Colour Seven Fashion.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-black text-white">
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <AnalyticsTracker />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <CartDrawer />
          <LiveReviewNotificationPopup />
        </Providers>
      </body>
    </html>
  );
}
