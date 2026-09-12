import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, string>();

/**
 * Settings store either a legacy data URL (guest / pre-cloud) or a storage
 * path inside the private `wallpapers` bucket. This resolves both to a URL
 * that can be rendered.
 */
export function useWallpaperUrl(value: string | null): string | null {
  const direct = !value || value.startsWith("data:") || value.startsWith("http") ? value : null;
  const [url, setUrl] = useState<string | null>(direct ?? (value ? (cache.get(value) ?? null) : null));

  useEffect(() => {
    if (!value) {
      setUrl(null);
      return;
    }
    if (value.startsWith("data:") || value.startsWith("http")) {
      setUrl(value);
      return;
    }
    const cached = cache.get(value);
    if (cached) {
      setUrl(cached);
      return;
    }
    let cancelled = false;
    void supabase.storage
      .from("wallpapers")
      .createSignedUrl(value, 60 * 60 * 24 * 7)
      .then(({ data }) => {
        if (cancelled || !data?.signedUrl) return;
        cache.set(value, data.signedUrl);
        setUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return url;
}
