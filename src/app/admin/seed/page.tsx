"use client";

import { useState } from "react";
import { seedDatabase, seedCategories, seedBrands } from "@/lib/seedDatabase";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function AdminSeed() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const handleSeedAll = async () => {
    setLoading(true);
    setMessage("Seeding database...");
    setMessageType("info");

    try {
      await seedDatabase();
      setMessage("✓ Database seeded successfully! All categories and brands have been added.");
      setMessageType("success");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedCategories = async () => {
    setLoading(true);
    setMessage("Seeding categories...");
    setMessageType("info");

    try {
      await seedCategories();
      setMessage("✓ Categories seeded successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedBrands = async () => {
    setLoading(true);
    setMessage("Seeding brands...");
    setMessageType("info");

    try {
      await seedBrands();
      setMessage("✓ Brands seeded successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Database Seeding</h1>
        <p className="text-zinc-500">
          Populate your database with initial categories and brands
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleSeedAll}
          disabled={loading}
          className="p-6 bg-gradient-to-br from-[#c9a227]/20 to-black border border-[#c9a227]/40 rounded-lg hover:border-[#c9a227]/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-[#c9a227]" />
            )}
            Seed Everything
          </h3>
          <p className="text-sm text-zinc-400">
            Load all categories and brands at once
          </p>
        </button>

        <button
          onClick={handleSeedCategories}
          disabled={loading}
          className="p-6 bg-zinc-900 border border-white/10 rounded-lg hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-blue-400" />
            )}
            Seed Categories
          </h3>
          <p className="text-sm text-zinc-400">
            Load 8 product categories only
          </p>
        </button>

        <button
          onClick={handleSeedBrands}
          disabled={loading}
          className="p-6 bg-zinc-900 border border-white/10 rounded-lg hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-purple-400" />
            )}
            Seed Brands
          </h3>
          <p className="text-sm text-zinc-400">
            Load 60+ brands (requires categories)
          </p>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            messageType === "success"
              ? "bg-green-500/10 border-green-500 text-green-400"
              : messageType === "error"
              ? "bg-red-500/10 border-red-500 text-red-400"
              : "bg-blue-500/10 border-blue-500 text-blue-400"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : messageType === "error" ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <Loader className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />
          )}
          <div>
            <p className="font-semibold">{message}</p>
            {messageType === "success" && (
              <p className="text-sm mt-1 opacity-90">
                Go to Categories or Brands page to see the seeded data
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold">What gets seeded?</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-[#c9a227] mb-2">8 Categories:</h3>
            <p className="text-sm text-zinc-400 mb-2">
              Watches, Clothing, Shoes, Accessories, Bags, Perfumes, Sunglasses, Electronics
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[#c9a227] mb-2">60+ Brands:</h3>
            <ul className="text-sm text-zinc-400 space-y-1 columns-2">
              <li>✓ Rolex • Casio • G-Shock • Omega • Tag Heuer</li>
              <li>✓ Tissot • Patek Philippe • Breitling • Cartier</li>
              <li>✓ Hublot • Richard Mille • Audemars Piguet</li>
              <li>✓ Gucci • Versace • Bvlgari • Ferrari</li>
              <li>✓ Armani • Tommy Hilfiger • Calvin Klein</li>
              <li>✓ And many more...</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-600">
            <p className="font-semibold mb-1">⚠️ Note:</p>
            <p>
              Make sure your Supabase database tables are created first. Run the SQL queries from SETUP_GUIDE.md if you haven't already.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
