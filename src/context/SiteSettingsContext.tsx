"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/types/database";

interface SiteSettingsContextType {
  settings: Record<string, Record<string, unknown>>;
  loaded: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  updateSetting: (key: string, value: Record<string, unknown>) => Promise<void>;
  getSetting: (key: string) => Record<string, unknown> | undefined;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(
  undefined
);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, Record<string, unknown>>>({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoaded(true);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      const settingsMap: Record<string, Record<string, unknown>> = {};
      if (data) {
        data.forEach((setting) => {
          settingsMap[setting.setting_key] = setting.setting_value as Record<string, unknown>;
        });
      }

      setSettings(settingsMap);
    } catch (error: any) {
    console.error("Supabase error:", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      fullError: JSON.stringify(error, null, 2)
    });
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateSetting = useCallback(async (key: string, value: Record<string, unknown>) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Cannot update site setting without database connection.");
    }

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString(),
        });

      if (error)
    throw new Error(error?.message || JSON.stringify(error) || "Unknown error");

      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    } catch (error: any) {
    console.error("Supabase error:", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      fullError: JSON.stringify(error, null, 2)
    });
    
    throw new Error(error?.message || JSON.stringify(error) || "Unknown error");
    }
  }, []);

  const getSetting = useCallback(
    (key: string) => settings[key],
    [settings]
  );

  const value = {
    settings,
    loaded,
    loading,
    refresh,
    updateSetting,
    getSetting,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}
