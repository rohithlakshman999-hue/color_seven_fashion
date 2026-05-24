"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useCatalog } from "@/context/CatalogContext";

export default function Footer() {
  const { categories } = useCatalog();
  const shopLinks = categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);
  return (
    <footer className="bg-black pt-16 pb-8 text-white border-t border-white/10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 flex flex-col items-start">
            <Logo className="mb-6 -ml-2" />
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Premium modern fashion and luxury streetwear. Elevating everyday styling with bold design and unmatched quality.
            </p>
            <div className="flex space-x-6 text-sm font-bold tracking-wider">
              <a href="#" className="text-zinc-500 hover:text-[var(--accent-1)] transition-luxury">
                INSTAGRAM
              </a>
              <a href="#" className="text-zinc-500 hover:text-[var(--accent-1)] transition-luxury">
                TWITTER
              </a>
              <a href="#" className="text-zinc-500 hover:text-[var(--accent-1)] transition-luxury">
                FACEBOOK
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-xs text-[var(--accent-1)] mb-6">Shop</h3>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li>
                <Link href="/shop" className="hover:text-white transition-luxury">All Products</Link>
              </li>
              {shopLinks.map((category) => (
                <li key={category.id}>
                  <Link href={`/shop/${category.slug}`} className="hover:text-white transition-luxury">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-xs text-[var(--accent-1)] mb-6">Customer Care</h3>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li>
                <Link href="/contact" className="hover:text-white transition-luxury">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-luxury">FAQ</Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-luxury">Shipping & Returns</Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-luxury">Track Order</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-xs text-[var(--accent-1)] mb-6">Newsletter</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-zinc-950 border border-white/10 text-white px-4 py-2 w-full focus:outline-none focus:border-[var(--accent-1)] transition-luxury text-sm"
              />
              <button
                type="button"
                className="bg-[var(--accent-1)] text-black px-4 py-2 text-sm font-black uppercase tracking-wider hover:bg-white hover:text-black transition-luxury"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} COLOUR SEVEN FASHION. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-luxury">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-luxury">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
