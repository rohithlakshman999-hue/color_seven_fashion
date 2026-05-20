import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Circular Logo Icon with glow */}
      <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 inline-flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#c9a227]/20 blur-md group-hover:bg-[#c9a227]/40 transition-all duration-500" />
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#c9a227]/40 group-hover:border-[#c9a227]/80 transition-all duration-300 shadow-[0_0_20px_rgba(201,162,39,0.2)] group-hover:shadow-[0_0_30px_rgba(201,162,39,0.5)] flex items-center justify-center">
          <div className="text-[#c9a227] text-xs md:text-sm font-black tracking-tighter">7</div>
        </div>
      </div>

      {/* Brand Name */}
      <div className="flex flex-col leading-tight">
        <span className="font-serif text-sm md:text-base tracking-[0.12em] text-[#c9a227] uppercase group-hover:text-[#e0b83a] transition-colors duration-300 font-black">
          COLOUR SEVEN
        </span>
        <span className="text-[8px] md:text-[9px] tracking-[0.35em] text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300 uppercase font-bold letter-spacing-wider">
          FASHION
        </span>
      </div>
    </Link>
  );
}
