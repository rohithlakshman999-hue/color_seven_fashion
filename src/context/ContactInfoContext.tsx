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
import type { ContactInfo } from "@/types/database";

interface ContactInfoContextType {
  contactInfo: ContactInfo | null;
  loaded: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  updateContactInfo: (info: Partial<ContactInfo>) => Promise<void>;
}

const ContactInfoContext = createContext<ContactInfoContextType | undefined>(
  undefined
);

export function ContactInfoProvider({ children }: { children: ReactNode }) {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
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
        .from("contact_info")
        .select("*")
        .eq("is_active", true);

      if (error) {
        throw error;
      } else {
        setContactInfo((data?.[0] as ContactInfo) || null);
      }
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

  const updateContactInfo = useCallback(async (info: Partial<ContactInfo>) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Cannot update contact info without database connection.");
    }

    try {
      const { error } = await supabase
        .from("contact_info")
        .upsert({
          ...info,
          updated_at: new Date().toISOString(),
        });

      if (error)
    throw new Error(error?.message || JSON.stringify(error) || "Unknown error");

      await refresh();
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
  }, [refresh]);

  const value = {
    contactInfo,
    loaded,
    loading,
    refresh,
    updateContactInfo,
  };

  return (
    <ContactInfoContext.Provider value={value}>
      {children}
    </ContactInfoContext.Provider>
  );
}

export function useContactInfo() {
  const context = useContext(ContactInfoContext);
  if (!context) {
    throw new Error("useContactInfo must be used within a ContactInfoProvider");
  }
  return context;
}
