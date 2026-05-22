"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { useHomepageContent } from "@/context/HomepageContentContext";

export default function AdminHomepagePage() {
  const { content, loaded, loading, refresh, updateSection, getSection } = useHomepageContent();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" | "" });

  const [heroContent, setHeroContent] = useState({
    left_image: "/images/0816a53b-7f43-45cb-a73e-7d2bd6ef8278.jpg",
    right_image: "/images/0a479a6e-62c8-434f-9312-7d03855c149b.jpg",
    title: "LEGENDS. STYLE. YOU.",
    subtitle: "CLOTHES | SHOES | ACCESSORIES | WATCHES",
  });

  const [categoriesContent, setCategoriesContent] = useState({
    enabled: true,
    title: "EXPLORE CATEGORIES",
  });

  const [trendingContent, setTrendingContent] = useState({
    enabled: true,
    title: "TRENDING NOW",
  });

  const [brandPillarsContent, setBrandPillarsContent] = useState({
    enabled: true,
  });

  useEffect(() => {
    if (loaded) {
      const hero = getSection("hero");
      if (hero) setHeroContent(hero as typeof heroContent);

      const categories = getSection("categories");
      if (categories) setCategoriesContent(categories as typeof categoriesContent);

      const trending = getSection("trending");
      if (trending) setTrendingContent(trending as typeof trendingContent);

      const brandPillars = getSection("brand_pillars");
      if (brandPillars) setBrandPillarsContent(brandPillars as typeof brandPillarsContent);
    }
  }, [loaded, getSection]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      await Promise.all([
        updateSection("hero", heroContent),
        updateSection("categories", categoriesContent),
        updateSection("trending", trendingContent),
        updateSection("brand_pillars", brandPillarsContent),
      ]);

      setMessage({ text: "Homepage content saved successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Failed to save homepage content:", error);
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
            Homepage Content
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Manage homepage sections and content
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

      {/* Hero Section */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Hero Section</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Left Image URL
            </label>
            <input
              type="text"
              value={heroContent.left_image}
              onChange={(e) => setHeroContent({ ...heroContent, left_image: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Right Image URL
            </label>
            <input
              type="text"
              value={heroContent.right_image}
              onChange={(e) => setHeroContent({ ...heroContent, right_image: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Title
          </label>
          <input
            type="text"
            value={heroContent.title}
            onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Subtitle
          </label>
          <input
            type="text"
            value={heroContent.subtitle}
            onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Categories Section</h2>
        
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Title
          </label>
          <input
            type="text"
            value={categoriesContent.title}
            onChange={(e) => setCategoriesContent({ ...categoriesContent, title: e.target.value })}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="categories-enabled"
            checked={categoriesContent.enabled}
            onChange={(e) => setCategoriesContent({ ...categoriesContent, enabled: e.target.checked })}
            className="w-5 h-5 rounded border-white/10 bg-black text-[var(--accent-1)] focus:ring-[var(--accent-1)]"
          />
          <label htmlFor="categories-enabled" className="text-sm text-white">
            Enable Categories Section
          </label>
        </div>
      </div>

      {/* Trending Section */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Trending Section</h2>
        
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Title
          </label>
          <input
            type="text"
            value={trendingContent.title}
            onChange={(e) => setTrendingContent({ ...trendingContent, title: e.target.value })}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="trending-enabled"
            checked={trendingContent.enabled}
            onChange={(e) => setTrendingContent({ ...trendingContent, enabled: e.target.checked })}
            className="w-5 h-5 rounded border-white/10 bg-black text-[var(--accent-1)] focus:ring-[var(--accent-1)]"
          />
          <label htmlFor="trending-enabled" className="text-sm text-white">
            Enable Trending Section
          </label>
        </div>
      </div>

      {/* Brand Pillars Section */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white">Brand Pillars Section</h2>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="brand-pillars-enabled"
            checked={brandPillarsContent.enabled}
            onChange={(e) => setBrandPillarsContent({ ...brandPillarsContent, enabled: e.target.checked })}
            className="w-5 h-5 rounded border-white/10 bg-black text-[var(--accent-1)] focus:ring-[var(--accent-1)]"
          />
          <label htmlFor="brand-pillars-enabled" className="text-sm text-white">
            Enable Brand Pillars Section
          </label>
        </div>
      </div>
    </motion.div>
  );
}
