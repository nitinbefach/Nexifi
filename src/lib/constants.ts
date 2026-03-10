export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "NEXIFI",
  tagline: "Next is Now",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
};

export const NAV_CATEGORIES = [
  { name: "Dash Cam", slug: "dash-cam-car" },
  { name: "Smart Watch", slug: "smart-watch" },
  { name: "Trimmer", slug: "trimmer" },
  { name: "Earphones", slug: "earphones" },
  { name: "Video Games", slug: "video-games" },
  { name: "Toys", slug: "toys-accessories" },
  { name: "Home Appliances", slug: "home-appliances" },
  { name: "Speakers", slug: "speakers" },
] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "cod_pending",
  "cod_collected",
] as const;

export const RETURN_REASONS = [
  { value: "defective", label: "Product is defective" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "not_as_described", label: "Not as described" },
  { value: "size_issue", label: "Size/fit issue" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "other", label: "Other reason" },
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
] as const;
