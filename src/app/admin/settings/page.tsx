"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function AdminSettingsPage() {
  const { settings, loaded, loading, refresh, updateSetting, getSetting } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" | "" });

  const [siteName, setSiteName] = useState("Colour Seven Fashion");
  const [announcementText, setAnnouncementText] = useState("FREE SHIPPING ON ORDERS ABOVE ₹999");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [seoTitle, setSeoTitle] = useState("COLOUR SEVEN FASHION");
  const [seoDescription, setSeoDescription] = useState("Premium modern streetwear, watches, shoes & accessories — Colour Seven Fashion.");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");

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
    }
  }, [loaded, getSetting]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      await Promise.all([
        updateSetting("site_name", { value: siteName }),
        updateSetting("announcement_bar", { text: announcementText, enabled: announcementEnabled }),
        updateSetting("seo_metadata", { title: seoTitle, description: seoDescription }),
        updateSetting("social_links", { instagram, twitter, facebook }),
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
