import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getInvoiceByOrderId, createInvoice } from "@/lib/supabase/admin-queries";
import { generateInvoicePDF } from "@/lib/invoice-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // 1. Fetch order with items
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 2. Check if invoice already exists
    let invoiceNumber: string;
    const { invoice: existing } = await getInvoiceByOrderId(orderId);

    if (existing) {
      invoiceNumber = existing.invoice_number;
    } else {
      // 3. Create a new invoice record
      // Generate a sequential invoice number
      const { count: invoiceCount } = await supabaseAdmin
        .from("invoices")
        .select("id", { count: "exact", head: true });

      const nextNum = (invoiceCount ?? 0) + 1;
      invoiceNumber = `INV-${String(nextNum).padStart(5, "0")}`;

      const { error: createError } = await createInvoice({
        order_id: orderId,
        invoice_number: invoiceNumber,
        amount: order.total_amount,
      });

      if (createError) {
        // If duplicate, try fetching again (race condition)
        const { invoice: retryInvoice } = await getInvoiceByOrderId(orderId);
        if (retryInvoice) {
          invoiceNumber = retryInvoice.invoice_number;
        } else {
          return NextResponse.json(
            { error: "Failed to create invoice" },
            { status: 500 }
          );
        }
      }
    }

    // 4. Generate PDF
    const pdfBytes = generateInvoicePDF(order, invoiceNumber);

    // 5. Return PDF response
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoiceNumber}.pdf"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
