"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader, CheckCircle, AlertCircle, Truck, Zap, Sparkles } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function AdminSettingsPage() {
  const { settings, loaded, loading, refresh, updateSetting, getSetting } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" | "" });

  const [siteName, setSiteName] = useState("Colour Seven Fashion");
  const [announcementText, setAnnouncementText] = useState("NEW ARRIVALS DROPPING EVERY WEEK 🛍️ / TRENDING WATCHES & FASHION ACCESSORIES ⌚");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [seoTitle, setSeoTitle] = useState("COLOUR SEVEN FASHION");
  const [seoDescription, setSeoDescription] = useState("Premium modern streetwear, watches, shoes & accessories — Colour Seven Fashion.");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");

  // Delivery & Shipping Controls
  const [deliveryCharge, setDeliveryCharge] = useState<string>("0");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<string>("0");
  const [deliveryLabel, setDeliveryLabel] = useState<string>("Pan-India Delivery");

  useEffect(() => {
    if (loaded) {
      const siteNameSetting = getSetting("site_name");
      if (siteNameSetting?.value) setSiteName(siteNameSetting.value as string);

      const announcementSetting = getSetting("announcement_bar");
      if (announcementSetting) {
        const announcement = announcementSetting as { text?: string; enabled?: boolean };
        if (announcement.text) setAnnouncementText(announcement.text);
        if (typeof announcement.enabled === "boolean") setAnnouncementEnabled(announcement.enabled);
      }

      const seoSetting = getSetting("seo_metadata");
      if (seoSetting) {
        const seo = seoSetting as { title?: string; description?: string };
        if (seo.title) setSeoTitle(seo.title);
        if (seo.description) setSeoDescription(seo.description);
      }

      const socialSetting = getSetting("social_links");
      if (socialSetting) {
        const social = socialSetting as { instagram?: string; twitter?: string; facebook?: string };
        if (social.instagram) setInstagram(social.instagram);
        if (social.twitter) setTwitter(social.twitter);
        if (social.facebook) setFacebook(social.facebook);
      }

      const shippingSetting = getSetting("shipping_settings");
      if (shippingSetting) {
        if (shippingSetting.delivery_charge !== undefined) {
          setDeliveryCharge(String(shippingSetting.delivery_charge));
        }
        if (shippingSetting.free_delivery_threshold !== undefined) {
          setFreeDeliveryThreshold(String(shippingSetting.free_delivery_threshold));
        }
        if (shippingSetting.delivery_label) {
          setDeliveryLabel(String(shippingSetting.delivery_label));
        }
      }
    }
  }, [loaded, getSetting]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const parsedDelivery = Math.max(0, parseFloat(deliveryCharge) || 0);
      const parsedThreshold = Math.max(0, parseFloat(freeDeliveryThreshold) || 0);
      const parsedLabel = deliveryLabel.trim() || "Pan-India Delivery";

      await Promise.all([
        updateSetting("site_name", { value: siteName }),
        updateSetting("announcement_bar", { text: announcementText, enabled: announcementEnabled }),
        updateSetting("seo_metadata", { title: seoTitle, description: seoDescription }),
        updateSetting("social_links", { instagram, twitter, facebook }),
        updateSetting("shipping_settings", {
          delivery_charge: parsedDelivery,
          free_delivery_threshold: parsedThreshold,
          delivery_label: parsedLabel,
        }),
      ]);

      setMessage({ text: "Settings saved successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
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
            Site Settings
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Manage global site configuration
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

      {/* ── Delivery & Shipping Configuration ── */}
      <div className="bg-[#070707] border border-white/10 rounded-2xl p-6 space-y-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-1)]/10 border border-[var(--accent-1)]/30 flex items-center justify-center">
              <Truck className="w-5 h-5 text-[var(--accent-1)]" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-white">
                Delivery & Shipping Configuration
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set customer delivery charges, free delivery thresholds, and storefront display titles
              </p>
            </div>
          </div>
          <div>
            {(parseFloat(deliveryCharge) || 0) === 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                100% Free Shipping Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c9a227]/10 text-[#c9a227] border border-[#c9a227]/20">
                Standard ₹{parseFloat(deliveryCharge) || 0} Delivery
                {(parseFloat(freeDeliveryThreshold) || 0) > 0 && ` (Free > ₹${parseFloat(freeDeliveryThreshold)})`}
              </span>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-2">
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDeliveryCharge("0");
                setFreeDeliveryThreshold("0");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black border border-white/10 text-zinc-300 hover:border-[var(--accent-1)] hover:text-white transition-colors"
            >
              100% Free Everywhere (₹0)
            </button>
            <button
              type="button"
              onClick={() => {
                setDeliveryCharge("49");
                setFreeDeliveryThreshold("0");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black border border-white/10 text-zinc-300 hover:border-[var(--accent-1)] hover:text-white transition-colors"
            >
              Flat ₹49 Delivery
            </button>
            <button
              type="button"
              onClick={() => {
                setDeliveryCharge("99");
                setFreeDeliveryThreshold("0");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black border border-white/10 text-zinc-300 hover:border-[var(--accent-1)] hover:text-white transition-colors"
            >
              Flat ₹99 Delivery
            </button>
            <button
              type="button"
              onClick={() => {
                setDeliveryCharge("99");
                setFreeDeliveryThreshold("999");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black border border-white/10 text-zinc-300 hover:border-[var(--accent-1)] hover:text-white transition-colors"
            >
              ₹99 (Free above ₹999)
            </button>
            <button
              type="button"
              onClick={() => {
                setDeliveryCharge("149");
                setFreeDeliveryThreshold("1499");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black border border-white/10 text-zinc-300 hover:border-[var(--accent-1)] hover:text-white transition-colors"
            >
              ₹149 (Free above ₹1,499)
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Delivery Charge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Standard Delivery Charge (₹)
              </label>
              <span className="text-[10px] text-zinc-500 font-semibold">Enter 0 for Free</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                placeholder="0"
                className="w-full bg-black border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none font-bold"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              The fee charged to the customer at cart and WhatsApp checkout.
            </p>
          </div>

          {/* Free Delivery Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Free Delivery Above (₹)
              </label>
              <span className="text-[10px] text-zinc-500 font-semibold">Optional</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                placeholder="0 (disabled)"
                className="w-full bg-black border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none font-bold"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Orders at or above this subtotal unlock free delivery. Enter 0 to disable.
            </p>
          </div>

          {/* Delivery Label */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Delivery Display Label
              </label>
              <span className="text-[10px] text-zinc-500 font-semibold">In Cart Summary</span>
            </div>
            <input
              type="text"
              value={deliveryLabel}
              onChange={(e) => setDeliveryLabel(e.target.value)}
              placeholder="Pan-India Delivery"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none font-medium"
            />
            <p className="text-[11px] text-zinc-500">
              Shown next to the fee in the customer cart (e.g. Pan-India Delivery).
            </p>
          </div>
        </div>

        {/* Live Customer Cart Preview */}
        <div className="bg-black/60 border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-1)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Live Storefront Customer Cart Preview
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              Matches your customer checkout
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Scenario A: Regular order */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-lg p-3 space-y-2 text-xs">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
                Example 1: Standard Order (₹450)
              </span>
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white font-semibold">₹450.00</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>{deliveryLabel || "Pan-India Delivery"}</span>
                {parseFloat(deliveryCharge) > 0 ? (
                  <span className="text-white font-bold">₹{parseFloat(deliveryCharge).toFixed(2)}</span>
                ) : (
                  <span className="text-[#c9a227] font-bold">FREE</span>
                )}
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-white">
                <span>Final Payable</span>
                <span className="text-[var(--accent-1)]">
                  ₹{(450 + (parseFloat(deliveryCharge) || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Scenario B: Higher order (testing threshold) */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-lg p-3 space-y-2 text-xs">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
                Example 2: Qualifying Order (₹1,500)
              </span>
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white font-semibold">₹1,500.00</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>{deliveryLabel || "Pan-India Delivery"}</span>
                {parseFloat(freeDeliveryThreshold) > 0 && 1500 >= parseFloat(freeDeliveryThreshold) ? (
                  <span className="flex items-center gap-1.5 font-bold text-[#c9a227]">
                    {parseFloat(deliveryCharge) > 0 && (
                      <span className="text-zinc-500 line-through text-[11px] font-normal">
                        ₹{parseFloat(deliveryCharge).toFixed(2)}
                      </span>
                    )}
                    <span>FREE</span>
                  </span>
                ) : parseFloat(deliveryCharge) > 0 ? (
                  <span className="text-white font-bold">₹{parseFloat(deliveryCharge).toFixed(2)}</span>
                ) : (
                  <span className="text-[#c9a227] font-bold">FREE</span>
                )}
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-white">
                <span>Final Payable</span>
                <span className="text-[var(--accent-1)]">
                  ₹{
                    (
                      1500 +
                      (parseFloat(freeDeliveryThreshold) > 0 && 1500 >= parseFloat(freeDeliveryThreshold)
                        ? 0
                        : parseFloat(deliveryCharge) || 0)
                    ).toFixed(2)
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Site Name */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Site Name</h2>
        
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Site Name
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Announcement Bar</h2>
        
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Announcement Text
          </label>
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="announcement-enabled"
            checked={announcementEnabled}
            onChange={(e) => setAnnouncementEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-white/10 bg-black text-[var(--accent-1)] focus:ring-[var(--accent-1)]"
          />
          <label htmlFor="announcement-enabled" className="text-sm text-white">
            Enable Announcement Bar
          </label>
        </div>
      </div>

      {/* SEO Metadata */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">SEO Metadata</h2>
        
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Page Title
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Meta Description
          </label>
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={3}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Social Media Links</h2>
        
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Instagram URL
          </label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/yourusername"
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
            placeholder="https://twitter.com/yourusername"
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
            placeholder="https://facebook.com/yourusername"
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>
      </div>
    </motion.div>
  );
}
