"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

const aboutSections = [
  {
    id: "a1",
    title: "Uncompromising Quality",
    subtitle: "01 / Aesthetic",
    description: "Every piece in our collection is meticulously sourced from premium export surplus lines. Minimalist design meets bold execution, featuring dark palettes and structured silhouettes. We deliver exceptional fabrics at accessible price points without sacrificing the luxury aesthetic.",
    image: "/images/black_hoodie.png"
  },
  {
    id: "a2",
    title: "Sustainability",
    subtitle: "02 / Responsibility",
    description: "Repurposing export surplus to reduce fashion waste while maintaining premium standards. We believe in a circular fashion ecosystem where high-quality garments find their rightful place rather than ending up in landfills.",
    image: "/images/nike_air_force.png"
  },
  {
    id: "a3",
    title: "Community",
    subtitle: "03 / Culture",
    description: "Built for the culture. Colour Seven isn't just a brand, it's a movement of authentic self-expression. Designed for those who lead, not follow. We empower individuals to embrace their unique styling identity.",
    image: "/images/graphic_tee.png"
  }
];

export default function About() {
  return (
    <div className="pt-16 pb-24 bg-black min-h-screen text-white">
      {/* Header Banner */}
      <div className="bg-[#030303] border-b border-white/5 py-16 mb-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-[rgba(207,242,39,0.03)] rounded-full filter blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-[var(--accent-1)]" />
            THE COLOUR SEVEN ETHOS
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm tracking-[0.25em] uppercase font-bold">
            COLOUR SEVEN FASHION &bull; BRAND ETHICS
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex flex-col space-y-16 md:space-y-28">
          {aboutSections.map((section, index) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${
                index % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image Box */}
              <div className="w-full lg:w-3/5 aspect-[4/3] relative overflow-hidden bg-zinc-950 group rounded-2xl border border-white/10 shadow-2xl" style={{ position: "relative" }}>
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Text Box */}
              <div className="w-full lg:w-2/5 flex flex-col justify-center text-center lg:text-left px-4">
                <span className="text-[var(--accent-1)] uppercase tracking-[0.25em] text-[10px] font-black mb-3">
                  {section.subtitle}
                </span>
                <h2 className="font-serif text-3xl text-white mb-6 uppercase tracking-wider skew-x-[-8deg] leading-tight">
                  {section.title}
                </h2>
                <p className="text-zinc-400 font-medium leading-relaxed mb-8 text-xs md:text-sm">
                  {section.description}
                </p>
                {index === aboutSections.length - 1 && (
                  <Link
                    href="/shop"
                    className="inline-flex items-center space-x-3 text-black bg-[var(--accent-1)] hover:bg-white hover:text-black transition-all px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg mx-auto lg:mx-0 w-fit"
                  >
                    <span>Join the Movement</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
