"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Phone } from "lucide-react";

interface Notification {
  id: string;
  order_id: string;
  channel: "email" | "sms" | "whatsapp";
  type: string;
  status: "pending" | "sent" | "failed";
  metadata: Record<string, unknown> | null;
  created_at: string;
  order: { order_number: string } | null;
}

type FilterTab = "all" | "email" | "sms" | "whatsapp";

interface Props {
  initialNotifications: Notification[];
}

const CHANNEL_STYLES: Record<string, string> = {
  email: "bg-blue-100 text-blue-700",
  sms: "bg-purple-100 text-purple-700",
  whatsapp: "bg-green-100 text-green-700",
};

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  sms: Phone,
  whatsapp: MessageSquare,
};

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

function formatType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function NotificationsClient({ initialNotifications }: Props) {
  const notifications = initialNotifications;
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.channel === activeTab;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: notifications.length },
    { key: "email", label: "Email", count: notifications.filter((n) => n.channel === "email").length },
    { key: "sms", label: "SMS", count: notifications.filter((n) => n.channel === "sms").length },
    { key: "whatsapp", label: "WhatsApp", count: notifications.filter((n) => n.channel === "whatsapp").length },
  ];

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Notification Log</h2>
      <p className="mt-1 text-sm text-gray-500">
        {notifications.length} notification{notifications.length !== 1 ? "s" : ""} — view all system notifications sent to customers.
      </p>

      {/* Filter Tabs */}
      <div className="mt-5 flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg bg-white py-16 text-center shadow">
            <Bell className="mx-auto size-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">
              {activeTab === "all"
                ? "No notifications yet."
                : `No ${activeTab} notifications.`}
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const ChannelIcon = CHANNEL_ICONS[n.channel] || Mail;

            return (
              <div
                key={n.id}
                className="rounded-lg bg-white p-4 shadow"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${CHANNEL_STYLES[n.channel] || "bg-gray-100 text-gray-600"}`}>
                      <ChannelIcon className="size-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                            CHANNEL_STYLES[n.channel] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {n.channel}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatType(n.type)}
                        </span>
                        {n.order?.order_number && (
                          <span className="font-mono text-xs text-nexifi-orange">
                            {n.order.order_number}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            STATUS_STYLES[n.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
