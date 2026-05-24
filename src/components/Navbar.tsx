"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Search, User, Heart, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { useCatalog } from "@/context/CatalogContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop", hasDropdown: true },
  { name: "About", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];



export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const pathname = usePathname();
  const { categories } = useCatalog();

  const shopSubLinks = categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => ({ name: c.name, href: `/shop/${c.slug}` }));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>

      {/* Infinite Rolling Announcement Bar */}
      <div className="bg-black text-[var(--accent-1)] text-[10px] md:text-xs font-black tracking-widest py-2.5 uppercase border-b border-white/5 relative z-[60] overflow-hidden w-full select-none">
        <div className="flex w-full relative">
          <div className="animate-marquee-scroll whitespace-nowrap flex items-center shrink-0">
            <span className="mx-6 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> FREE SHIPPING ON ORDERS ABOVE ₹999</span>
            <span className="text-zinc-700">/</span>
            <span className="mx-6 text-white">10% INSTANT DISCOUNT ON FIRST ORDER</span>
            <span className="text-zinc-700">/</span>
            <span className="mx-6 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> COLOUR SEVEN PREMIUM STREETWEAR EDITION</span>
            <span className="text-zinc-700">/</span>
          </div>
          <div className="animate-marquee-scroll2 whitespace-nowrap flex items-center shrink-0 absolute top-0 left-0">
            <span className="mx-6 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> FREE SHIPPING ON ORDERS ABOVE ₹999</span>
            <span className="text-zinc-700">/</span>
            <span className="mx-6 text-white">10% INSTANT DISCOUNT ON FIRST ORDER</span>
            <span className="text-zinc-700">/</span>
            <span className="mx-6 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> COLOUR SEVEN PREMIUM STREETWEAR EDITION</span>
            <span className="text-zinc-700">/</span>
          </div>
        </div>
      </div>
      
      <header
        className={`sticky top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-black/95 backdrop-blur-xl py-3 border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]" 
            : "bg-black/80 backdrop-blur-md py-5 border-b border-white/5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Left: Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-white hover:text-[var(--accent-1)] transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </motion.button>

          {/* Logo */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Logo />
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => {
              const isLinkActive = pathname === link.href;

              if (link.hasDropdown) {
                return (
                  <div
                    key={link.name}
                    className="relative py-2"
                    onMouseEnter={() => setIsShopHovered(true)}
                    onMouseLeave={() => setIsShopHovered(false)}
                  >
                    <Link
                      href={link.href}
                      className={`text-xs xl:text-sm font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-1 outline-none ${
                        isLinkActive || isShopHovered ? "text-[var(--accent-1)]" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>{link.name}</span>
                      <motion.div
                        animate={{ rotate: isShopHovered ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.div>
                    </Link>

                    {/* Animated Dropdown Menu */}
                    <AnimatePresence>
                      {isShopHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scaleY: 0.9 }}
                          animate={{ opacity: 1, y: 0, scaleY: 1 }}
                          exit={{ opacity: 0, y: 10, scaleY: 0.9 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-[#050505]/95 border border-white/10 rounded-xl py-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 origin-top overflow-hidden backdrop-blur-xl"
                        >
                          <div className="flex flex-col">
                            {shopSubLinks.map((sub, idx) => (
                              <motion.div
                                key={sub.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                              >
                                <Link
                                  href={sub.href}
                                  className="block px-5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-[var(--accent-1)] transition-all duration-200"
                                >
                                  {sub.name}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs xl:text-sm font-semibold tracking-wider uppercase transition-all duration-300 relative group py-1 ${
                    isLinkActive ? "text-[var(--accent-1)] font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {link.name}
                  <span 
                    className={`absolute -bottom-1 left-0 h-[2px] bg-[var(--accent-1)] transition-all duration-300 ${
                      isLinkActive ? "w-full" : "w-0 group-hover:w-full"
                    }`} 
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Search Icon */}
            <motion.button 
              whileHover={{ scale: 1.1, color: "var(--accent-1)" }} 
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </motion.button>
            
            {/* Account Icon */}
            <motion.button 
              whileHover={{ scale: 1.1, color: "var(--accent-1)" }} 
              className="text-zinc-400 hover:text-white transition-colors hidden md:block"
            >
              <User className="w-5 h-5" />
            </motion.button>

            {/* Wishlist Icon */}
            <motion.button 
              whileHover={{ scale: 1.1, color: "var(--accent-1)" }} 
              className="text-zinc-400 hover:text-white transition-colors relative group"
            >
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 bg-[var(--accent-1)] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                0
              </span>
            </motion.button>

            {/* Cart Icon */}
            <motion.button 
              whileHover={{ scale: 1.1, color: "var(--accent-1)" }} 
              className="text-zinc-400 hover:text-white transition-colors relative group"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 bg-[var(--accent-1)] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                0
              </span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex flex-col p-6 h-screen overflow-hidden border-r border-white/10 shadow-2xl md:hidden"
            >
              <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-4">
                <Logo />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white hover:text-[var(--accent-1)] transition-colors bg-zinc-900 p-2 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              
              <nav className="flex flex-col space-y-6 flex-1 mt-6 px-4 overflow-y-auto">
                {navLinks.map((link, idx) => {
                  if (link.hasDropdown) {
                    return (
                      <div key={link.name} className="flex flex-col">
                        <div className="flex items-center justify-between py-1">
                          <Link
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="text-2xl uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                          >
                            {link.name}
                          </Link>
                          <button
                            onClick={() => setMobileShopOpen(!mobileShopOpen)}
                            className="p-2 text-zinc-400 hover:text-[var(--accent-1)] transition-colors"
                          >
                            <motion.div
                              animate={{ rotate: mobileShopOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-6 h-6" />
                            </motion.div>
                          </button>
                        </div>
                        
                        <motion.div
                          initial={false}
                          animate={{ height: mobileShopOpen ? "auto" : 0 }}
                          className="overflow-hidden pl-4 flex flex-col space-y-3 mt-2 border-l border-white/10"
                        >
                          {shopSubLinks.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setIsOpen(false)}
                              className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--accent-1)] transition-colors py-1"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </motion.div>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-2xl uppercase tracking-widest transition-all duration-300 block ${
                          pathname === link.href 
                            ? "text-[var(--accent-1)] font-black translate-x-3" 
                            : "text-zinc-400 hover:text-white hover:translate-x-2"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-white/5 pt-8 pb-6">
                <div className="flex items-center justify-around space-x-6 text-sm text-gray-400">
                  <motion.button whileHover={{ scale: 1.1, color: "var(--accent-1)" }} className="hover:text-white transition-colors flex flex-col items-center space-y-2">
                    <User className="w-6 h-6" /> <span className="uppercase tracking-widest text-[10px]">Account</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1, color: "var(--accent-1)" }} className="hover:text-white transition-colors flex flex-col items-center space-y-2">
                    <Search className="w-6 h-6" /> <span className="uppercase tracking-widest text-[10px]">Search</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
