"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const menuItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/seed", label: "Seed Database" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/brands", label: "Brands" },
    { href: "/admin/products", label: "Products" },
  ];

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 border-r border-white/10 overflow-hidden`}
      >
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="text-2xl font-bold text-[#c9a227]">
            COLOUR SEVEN
          </Link>
          <p className="text-xs text-zinc-500 mt-1">Admin Dashboard</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(item.href)
                  ? "bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/40"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 absolute bottom-0 left-0 w-64">
          <Link
            href="/"
            className="w-full px-4 py-2 border border-white/10 rounded text-center text-sm hover:bg-white/5 transition-all"
          >
            Back to Store
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-white/10 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/5 rounded"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">Admin</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </div>
    </div>
  );
}
