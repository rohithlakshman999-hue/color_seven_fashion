import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProductProvider } from "@/context/ProductContext";

export const metadata: Metadata = {
  title: "COLOUR SEVEN FASHION",
  description: "Premium modern streetwear, watches, shoes & accessories — Colour Seven Fashion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-black text-white">
      <body className="min-h-full flex flex-col font-sans">
        <ProductProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ProductProvider>
      </body>
    </html>
  );
}
