"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { useContactInfo } from "@/context/ContactInfoContext";

export default function AdminContactPage() {
  const { contactInfo, loaded, loading, refresh, updateContactInfo } = useContactInfo();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" | "" });

  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");

  useEffect(() => {
    if (loaded && contactInfo) {
      setWhatsapp(contactInfo.whatsapp_number || "");
      setPhone(contactInfo.phone_number || "");
      setEmail(contactInfo.email || "");
      setAddress(contactInfo.address || "");
      setCity(contactInfo.city || "");
      setState(contactInfo.state || "");
      setPostalCode(contactInfo.postal_code || "");
      
      const social = contactInfo.social_media as Record<string, string> || {};
      setInstagram(social.instagram || "");
      setTwitter(social.twitter || "");
      setFacebook(social.facebook || "");
    }
  }, [loaded, contactInfo]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      await updateContactInfo({
        whatsapp_number: whatsapp,
        phone_number: phone,
        email,
        address,
        city,
        state,
        postal_code: postalCode,
        social_media: {
          instagram,
          twitter,
          facebook,
        },
      });

      setMessage({ text: "Contact information saved successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Failed to save contact info:", error);
      setMessage({ text: "Failed to save. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-[var(--accent-1)]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-serif">
            Contact Information
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Manage contact details and social media links
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[var(--accent-1)] text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Contact Details */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Contact Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              WhatsApp Number
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+919876543210"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@colourseven.com"
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>
      </div>

      {/* Address */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Address</h2>
        
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Street Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Fashion Street"
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Mumbai"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Maharashtra"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Postal Code
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="400001"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Social Media</h2>
        
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Instagram URL
          </label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/colourseven"
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Twitter URL
          </label>
          <input
            type="text"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://twitter.com/colourseven"
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Facebook URL
          </label>
          <input
            type="text"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/colourseven"
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>
      </div>
    </motion.div>
  );
}
