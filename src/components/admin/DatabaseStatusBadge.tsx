"use client";

import { useState } from "react";
import { Database, CheckCircle2, AlertTriangle, Copy, Check, RefreshCw } from "lucide-react";
import { AnalyticsStorageStatus } from "@/types/analytics";

interface Props {
  status: AnalyticsStorageStatus;
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
}

const SQL_MIGRATION = `-- Run in Supabase SQL Editor to enable Cloud Storage for Visitor Analytics:
CREATE TABLE IF NOT EXISTS website_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id VARCHAR(64) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  pathname VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),
  device_type VARCHAR(32) DEFAULT 'desktop',
  browser VARCHAR(64),
  os VARCHAR(64),
  ip_hash VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_visits_created_at ON website_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_visits_visitor_id ON website_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_website_visits_pathname ON website_visits(pathname);
CREATE INDEX IF NOT EXISTS idx_website_visits_visitor_created ON website_visits(visitor_id, created_at);

ALTER TABLE website_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert on website_visits" ON website_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select on website_visits" ON website_visits FOR SELECT USING (true);`;

export default function DatabaseStatusBadge({ status, onSync, isSyncing }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {status.isCloudConnected ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Supabase Cloud Connected</span>
            <span className="text-[10px] text-zinc-500 font-mono">
              ({status.totalRecords} records)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>Local Store Active</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                ({status.totalRecords} records)
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-[var(--accent-1)] hover:underline font-bold uppercase tracking-wider"
            >
              Enable Cloud Sync →
            </button>
          </div>
        )}

        {onSync && !status.isCloudConnected && status.totalRecords > 0 && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync to Supabase"}</span>
          </button>
        )}
      </div>

      {/* SQL Migration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black uppercase text-white tracking-wider">
                  Enable Supabase Cloud Storage
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Run this query once in your Supabase SQL Editor to store analytics permanently in the cloud.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <pre className="bg-black border border-white/10 rounded-2xl p-4 text-[11px] font-mono text-zinc-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {SQL_MIGRATION}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-1)] text-black text-xs font-bold transition-transform hover:scale-105"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy SQL"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs text-zinc-500">
                Local storage is currently active and preserving all real traffic.
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
