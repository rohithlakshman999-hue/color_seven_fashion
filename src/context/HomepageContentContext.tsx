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
import type { HomepageContent } from "@/types/database";

interface HomepageContentContextType {
  content: Record<string, Record<string, unknown>>;
  loaded: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  updateSection: (sectionName: string, content: Record<string, unknown>) => Promise<void>;
  getSection: (sectionName: string) => Record<string, unknown> | undefined;
}

const HomepageContentContext = createContext<HomepageContentContextType | undefined>(
  undefined
);

export function HomepageContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, Record<string, unknown>>>({});
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
        .from("homepage_content")
        .select("section_name, content")
        .eq("is_active", true);

      if (error) throw error;

      const contentMap: Record<string, Record<string, unknown>> = {};
      if (data) {
        data.forEach((item) => {
          contentMap[item.section_name] = item.content as Record<string, unknown>;
        });
      }

      setContent(contentMap);
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

  const updateSection = useCallback(async (sectionName: string, sectionContent: Record<string, unknown>) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Cannot update homepage section without database connection.");
    }

    try {
      const { error } = await supabase
        .from("homepage_content")
        .upsert({
          section_name: sectionName,
          content: sectionContent,
          is_active: true,
          updated_at: new Date().toISOString(),
        });

      if (error)
    throw new Error(error?.message || JSON.stringify(error) || "Unknown error");

      setContent((prev) => ({
        ...prev,
        [sectionName]: sectionContent,
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

  const getSection = useCallback(
    (sectionName: string) => content[sectionName],
    [content]
  );

  const value = {
    content,
    loaded,
    loading,
    refresh,
    updateSection,
    getSection,
  };

  return (
    <HomepageContentContext.Provider value={value}>
      {children}
    </HomepageContentContext.Provider>
  );
}

export function useHomepageContent() {
  const context = useContext(HomepageContentContext);
  if (!context) {
    throw new Error("useHomepageContent must be used within a HomepageContentProvider");
  }
  return context;
}
