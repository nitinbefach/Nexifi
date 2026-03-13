import { NextResponse } from "next/server";

const TEMPLATE_HEADERS = [
  "name",
  "category",
  "short_description",
  "description",
  "original_price",
  "selling_price",
  "sku",
  "stock_quantity",
  "tags",
  "image_url_1",
  "image_url_2",
  "image_url_3",
  "featured",
  "trending",
];

const SAMPLE_ROW = [
  "Wireless Bluetooth Earbuds",
  "Electronics",
  "Premium wireless earbuds with noise cancellation",
  "High-quality Bluetooth 5.3 earbuds with active noise cancellation and 30-hour battery life.",
  "1999",
  "999",
  "NXF-0001",
  "50",
  "earbuds,bluetooth,wireless",
  "https://placehold.co/600x600/7C3AED/white?text=Product",
  "",
  "",
  "yes",
  "no",
];

export async function GET() {
  const csv = [
    TEMPLATE_HEADERS.join(","),
    SAMPLE_ROW.map((val) => `"${val}"`).join(","),
  ].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="nexifi-bulk-upload-template.csv"',
    },
  });
}
