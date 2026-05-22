"use client";

import { MapPin, Phone, MessageSquare, Mail, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useContactInfo } from "@/context/ContactInfoContext";

export default function Contact() {
  const { contactInfo, loaded } = useContactInfo();

  const phone = contactInfo?.phone_number || "+91 9353812197";
  const whatsapp = contactInfo?.whatsapp_number || "+91 9353812197";
  const email = contactInfo?.email || "support@colourseven.com";
  const city = contactInfo?.city || "Bangalore";
  const state = contactInfo?.state || "India";
  const address = contactInfo?.address || "";

  return (
    <div className="pt-16 pb-24 bg-black min-h-screen text-white">
      {/* Header Banner */}
      <div className="bg-[#030303] border-b border-white/5 py-16 mb-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-[rgba(207,242,39,0.03)] rounded-full filter blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-[var(--accent-1)]" />
            GET IN TOUCH
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm tracking-[0.25em] uppercase font-bold">
            COLOUR SEVEN FASHION &bull; SUPPORT & SALES
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Contact Info Cards */}
          <div className="space-y-8">
            <h2 className="font-serif text-3xl text-white mb-6 uppercase tracking-wider skew-x-[-8deg] border-b border-white/5 pb-4">
              CONTACT INFO
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Phone Card */}
              <div className="p-5 bg-[#070707] border border-white/5 rounded-xl flex items-start space-x-4 hover:border-[var(--accent-1)] transition-all">
                <div className="p-3 bg-white/5 rounded-lg text-[var(--accent-1)]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="uppercase tracking-widest text-[10px] font-black text-zinc-500 mb-1">Phone</h3>
                  <p className="text-white text-xs font-bold">{phone}</p>
                  <p className="text-zinc-600 text-[10px] mt-1 font-bold">Mon-Sat 10am-7pm</p>
                </div>
              </div>

              {/* WhatsApp Card */}
              <div className="p-5 bg-[#070707] border border-white/5 rounded-xl flex items-start space-x-4 hover:border-[var(--accent-1)] transition-all">
                <div className="p-3 bg-white/5 rounded-lg text-[var(--accent-1)]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="uppercase tracking-widest text-[10px] font-black text-zinc-500 mb-1">WhatsApp</h3>
                  <p className="text-white text-xs font-bold">{whatsapp}</p>
                  <a 
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block mt-2 text-[10px] font-black uppercase text-[var(--accent-1)] hover:text-white transition-colors"
                  >
                    CHAT NOW &rarr;
                  </a>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-5 bg-[#070707] border border-white/5 rounded-xl flex items-start space-x-4 hover:border-[var(--accent-1)] transition-all">
                <div className="p-3 bg-white/5 rounded-lg text-[var(--accent-1)]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="uppercase tracking-widest text-[10px] font-black text-zinc-500 mb-1">Location</h3>
                  <p className="text-white text-xs font-bold">{address || `${city}, ${state}`}</p>
                  <p className="text-zinc-600 text-[10px] mt-1 font-bold">Pan India Shipping</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="p-5 bg-[#070707] border border-white/5 rounded-xl flex items-start space-x-4 hover:border-[var(--accent-1)] transition-all">
                <div className="p-3 bg-white/5 rounded-lg text-[var(--accent-1)]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="uppercase tracking-widest text-[10px] font-black text-zinc-500 mb-1">Email</h3>
                  <p className="text-white text-xs font-bold break-all">{email}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#070707] border border-white/5 p-8 md:p-12 rounded-2xl">
            <h2 className="font-serif text-3xl text-white mb-6 uppercase tracking-wider skew-x-[-8deg]">
              INQUIRY
            </h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--accent-1)] transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--accent-1)] transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--accent-1)] transition-all resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-[var(--accent-1)] text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-white hover:text-black transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
