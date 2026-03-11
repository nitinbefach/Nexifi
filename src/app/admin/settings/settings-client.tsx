"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import type { StoreSettingsMap, StoreSettingsValue } from "@/lib/supabase/admin-queries";

interface Props {
  initialSettings: StoreSettingsMap;
}

export default function SettingsClient({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const get = (key: string, fallback = ""): string => {
    const val = settings[key];
    if (val === null || val === undefined) return fallback;
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const getObj = (key: string): Record<string, string> => {
    const val = settings[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return val as Record<string, string>;
    }
    return {};
  };

  const update = (key: string, value: StoreSettingsValue) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const payload = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const socialLinks = getObj("social_links");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Store Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your NEXIFI store. Changes take effect immediately.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-nexifi-orange px-5 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving..." : "Save All"}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 max-w-3xl space-y-6">
        {/* General Settings */}
        <section className="rounded-lg bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">General</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Store Name"
              value={get("store_name")}
              onChange={(v) => update("store_name", v)}
            />
            <Field
              label="Tagline"
              value={get("store_tagline")}
              onChange={(v) => update("store_tagline", v)}
            />
            <Field
              label="GSTIN"
              value={get("store_gstin")}
              onChange={(v) => update("store_gstin", v)}
            />
            <Field
              label="WhatsApp Number"
              value={get("whatsapp_number")}
              onChange={(v) => update("whatsapp_number", v)}
              placeholder="91XXXXXXXXXX"
            />
          </div>
        </section>

        {/* Pricing & Tax */}
        <section className="rounded-lg bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">Pricing & Tax</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field
              label="COD Charge (₹)"
              value={get("cod_charge", "49")}
              onChange={(v) => update("cod_charge", Number(v) || 0)}
              type="number"
            />
            <Field
              label="GST Percent (%)"
              value={get("gst_percent", "18")}
              onChange={(v) => update("gst_percent", Number(v) || 0)}
              type="number"
            />
            <Field
              label="Free Shipping Threshold (₹)"
              value={get("free_shipping_threshold", "499")}
              onChange={(v) => update("free_shipping_threshold", Number(v) || 0)}
              type="number"
            />
          </div>
        </section>

        {/* Operational */}
        <section className="rounded-lg bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">Operational</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Return Window (days)"
              value={get("return_window_days", "7")}
              onChange={(v) => update("return_window_days", Number(v) || 7)}
              type="number"
            />
            <Field
              label="Low Stock Threshold"
              value={get("low_stock_threshold", "5")}
              onChange={(v) => update("low_stock_threshold", Number(v) || 5)}
              type="number"
            />
          </div>
        </section>

        {/* Social Links */}
        <section className="rounded-lg bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">Social Links</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field
              label="Instagram"
              value={socialLinks.instagram || ""}
              onChange={(v) =>
                update("social_links", { ...socialLinks, instagram: v })
              }
              placeholder="https://instagram.com/..."
            />
            <Field
              label="Facebook"
              value={socialLinks.facebook || ""}
              onChange={(v) =>
                update("social_links", { ...socialLinks, facebook: v })
              }
              placeholder="https://facebook.com/..."
            />
            <Field
              label="Twitter / X"
              value={socialLinks.twitter || ""}
              onChange={(v) =>
                update("social_links", { ...socialLinks, twitter: v })
              }
              placeholder="https://x.com/..."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
      />
    </div>
  );
}
