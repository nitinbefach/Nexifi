import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  order_number: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  discount_amount: number;
  shipping_charge: number;
  cod_charge: number;
  gst_amount: number;
  total_amount: number;
  payment_method: string;
  coupon_code: string | null;
  created_at: string;
  items: OrderItem[];
}

function formatINR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateInvoicePDF(
  order: Order,
  invoiceNumber: string
): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // ---- Header ----
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(242, 107, 29); // nexifi-orange
  doc.text("NEXIFI", margin, y + 8);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Next is Now", margin, y + 14);

  // Tax Invoice title — right aligned
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Tax Invoice", pageWidth - margin, y + 8, { align: "right" });

  y += 22;

  // Divider
  doc.setDrawColor(242, 107, 29);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ---- Invoice Info ----
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  const infoLeft = [
    `Invoice #: ${invoiceNumber}`,
    `Order #: ${order.order_number}`,
    `Date: ${new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    `Payment: ${order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method.toUpperCase()}`,
  ];

  for (const line of infoLeft) {
    doc.text(line, margin, y);
    y += 5;
  }

  y -= 20; // Go back up for right column

  // ---- Customer Info (right side) ----
  const addr = order.shipping_address;
  const customerLines = [
    `${addr.full_name || order.guest_name}`,
    order.guest_email,
    addr.phone || order.guest_phone,
    addr.address_line1,
    addr.address_line2 || "",
    `${addr.city}, ${addr.state} - ${addr.pincode}`,
  ].filter(Boolean);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Bill To:", pageWidth - margin - 70, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  for (const line of customerLines) {
    doc.text(line, pageWidth - margin - 70, y);
    y += 4.5;
  }

  y = Math.max(y, margin + 22 + 8 + 20) + 8;

  // ---- Items Table ----
  const items = order.items || [];
  const tableBody = items.map((item, i) => [
    String(i + 1),
    item.product_name,
    String(item.quantity),
    formatINR(item.unit_price),
    formatINR(item.total_price),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Product", "Qty", "Unit Price", "Total"]],
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [242, 107, 29],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [252, 245, 240],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ---- Summary ----
  const summaryX = pageWidth - margin - 70;
  const valueX = pageWidth - margin;

  const summaryLines: [string, string][] = [
    ["Subtotal", formatINR(order.subtotal)],
  ];

  if (order.discount_amount > 0) {
    summaryLines.push([
      `Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`,
      `- ${formatINR(order.discount_amount)}`,
    ]);
  }

  summaryLines.push(["Shipping", order.shipping_charge > 0 ? formatINR(order.shipping_charge) : "FREE"]);

  if (order.cod_charge > 0) {
    summaryLines.push(["COD Charge", formatINR(order.cod_charge)]);
  }

  summaryLines.push(["GST", formatINR(order.gst_amount)]);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  for (const [label, value] of summaryLines) {
    doc.text(label, summaryX, y);
    doc.text(value, valueX, y, { align: "right" });
    y += 5.5;
  }

  // Grand total
  y += 2;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(summaryX, y - 2, valueX, y - 2);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Grand Total", summaryX, y + 3);
  doc.setTextColor(242, 107, 29);
  doc.text(formatINR(order.total_amount), valueX, y + 3, { align: "right" });

  // ---- Footer ----
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for shopping with NEXIFI!", pageWidth / 2, footerY, {
    align: "center",
  });
  doc.text("www.nexifi.in", pageWidth / 2, footerY + 5, { align: "center" });

  // Return as Uint8Array
  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}
