"use client";

import { useState, useEffect } from "react";
import { checkStorageBuckets, setupStorageBuckets, isSupabaseConfigured } from "@/lib/setupStorage";
import { ArrowLeft, CheckCircle, AlertCircle, Loader, Database } from "lucide-react";
import Link from "next/link";

interface BucketStatus {
  configured: boolean;
  missing: string[];
  errors: string[];
}

interface SetupResult {
  success: boolean;
  created: string[];
  errors: string[];
  message: string;
}

export default function StorageSetupPage() {
  const [bucketStatus, setBucketStatus] = useState<BucketStatus | null>(null);
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkBucketsStatus();
  }, []);

  const checkBucketsStatus = async () => {
    setChecking(true);
    try {
      const status = await checkStorageBuckets();
      setBucketStatus(status);
    } catch (error) {
      setBucketStatus({
        configured: false,
        missing: [],
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
    } finally {
      setChecking(false);
    }
  };

  const handleSetupBuckets = async () => {
    setLoading(true);
    try {
      const result = await setupStorageBuckets();
      setSetupResult(result);
      // Check status again after setup
      setTimeout(checkBucketsStatus, 1000);
    } catch (error) {
      setSetupResult({
        success: false,
        created: [],
        errors: [error instanceof Error ? error.message : "Unknown error"],
        message: "Failed to set up buckets",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-white/5">
        <Link
          href="/admin"
          className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-serif">
            Storage Setup
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Initialize image storage buckets</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Supabase Configuration Check */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Supabase Configuration
          </h2>
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>✓ Supabase is configured</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Supabase is not configured</p>
                <p className="text-sm text-red-300/80 mt-1">
                  Add these variables to .env.local:
                </p>
                <ul className="text-xs text-red-300/60 mt-2 space-y-1 font-mono">
                  <li>NEXT_PUBLIC_SUPABASE_URL=your_url</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Buckets Status */}
        {checking ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex items-center justify-center gap-3">
            <Loader className="w-5 h-5 animate-spin text-[var(--accent-1)]" />
            <span>Checking storage buckets...</span>
          </div>
        ) : bucketStatus ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Buckets Status</h2>

            {bucketStatus.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-400">Errors</p>
                  <ul className="text-sm text-red-300 mt-2 space-y-1">
                    {bucketStatus.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {bucketStatus.missing.length > 0 ? (
              <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-400">Missing Buckets ({bucketStatus.missing.length})</p>
                  <ul className="text-sm text-yellow-300 mt-2 space-y-1 font-mono">
                    {bucketStatus.missing.map((bucket) => (
                      <li key={bucket}>• {bucket}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-400">✓ All storage buckets are configured!</p>
                  <p className="text-sm text-green-300 mt-1">You can now upload images from the admin dashboard.</p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Setup Result */}
        {setupResult && (
          <div
            className={`bg-zinc-900/50 border rounded-2xl p-6 flex items-start gap-3 ${
              setupResult.success
                ? "border-green-500 bg-green-500/5"
                : "border-red-500 bg-red-500/5"
            }`}
          >
            {setupResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p
                className={`font-medium ${
                  setupResult.success ? "text-green-400" : "text-red-400"
                }`}
              >
                {setupResult.message}
              </p>
              {setupResult.errors.length > 0 && (
                <ul
                  className={`text-sm mt-2 space-y-1 ${
                    setupResult.success
                      ? "text-green-300"
                      : "text-red-300"
                  }`}
                >
                  {setupResult.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Manual Setup Instructions */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Manual Setup (If Auto Setup Fails)</h2>
          <p className="text-sm text-zinc-400">
            If automatic setup fails, create these buckets manually in your Supabase dashboard:
          </p>
          <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
            <li>Go to Storage in Supabase Dashboard</li>
            <li>Click "New bucket" for each of these:
              <ul className="ml-6 mt-1 space-y-1 text-zinc-400">
                <li>• <code className="bg-black px-2 py-1 rounded">product-images</code> (5MB limit)</li>
                <li>• <code className="bg-black px-2 py-1 rounded">category-images</code> (5MB limit)</li>
                <li>• <code className="bg-black px-2 py-1 rounded">brand-logos</code> (2MB limit)</li>
                <li>• <code className="bg-black px-2 py-1 rounded">brand-banners</code> (5MB limit)</li>
              </ul>
            </li>
            <li>Make each bucket public by clicking "Edit" and toggling "Public"</li>
            <li>Click "Refresh" button below to verify</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSetupBuckets}
            disabled={loading || !isSupabaseConfigured}
            className="flex-1 bg-[var(--accent-1)] hover:bg-[var(--accent-1)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? "Setting Up..." : "Auto Setup Buckets"}
          </button>
          <button
            onClick={checkBucketsStatus}
            disabled={checking}
            className="px-6 bg-white/10 hover:bg-white/20 disabled:opacity-50 font-medium py-3 rounded-lg transition-all"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
