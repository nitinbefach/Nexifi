import { NextRequest, NextResponse } from "next/server";
import { parseExcelFile } from "@/lib/excel-parser";
import { bulkProductRowSchema } from "@/validators/bulk-product.schema";
import {
  createProductsBatch,
  getAdminCategories,
} from "@/lib/supabase/admin-queries";
import { generateSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      return NextResponse.json(
        { error: "Invalid file type. Only CSV and Excel files are supported." },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Parse the file
    const buffer = await file.arrayBuffer();
    const rows = parseExcelFile(buffer);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "File is empty or has no data rows." },
        { status: 400 }
      );
    }

    // Fetch categories for name-to-ID resolution
    const { categories } = await getAdminCategories();
    const categoryMap = new Map(
      categories.map((c: { id: string; name: string }) => [
        c.name.toLowerCase().trim(),
        c.id,
      ])
    );

    // Validate each row and prepare for insertion
    const validRows: {
      row: number;
      product: Record<string, unknown>;
      images: string[];
    }[] = [];
    const validationErrors: { row: number; messages: string[] }[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const rowNum = i + 2; // +2 because row 1 is headers, data starts at row 2

      // Validate with Zod
      const result = bulkProductRowSchema.safeParse(rawRow);

      if (!result.success) {
        const messages = result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`
        );
        validationErrors.push({ row: rowNum, messages });
        continue;
      }

      const data = result.data;

      // Resolve category name to ID
      const categoryId = categoryMap.get(data.category.toLowerCase().trim());
      if (!categoryId) {
        validationErrors.push({
          row: rowNum,
          messages: [
            `Category "${data.category}" not found. Available: ${categories.map((c: { name: string }) => c.name).join(", ")}`,
          ],
        });
        continue;
      }

      // Build product object
      const slug = generateSlug(data.name);
      const sku = data.sku || `NXF-${timestamp}-${String(i + 1).padStart(4, "0")}`;

      const product: Record<string, unknown> = {
        name: data.name.trim(),
        slug: `${slug}-${String(i + 1).padStart(3, "0")}`,
        description: data.description || null,
        short_description: data.short_description || null,
        category_id: categoryId,
        original_price: data.original_price,
        selling_price: data.selling_price,
        sku,
        stock_quantity: data.stock_quantity,
        is_active: true,
        is_featured: data.featured?.toLowerCase() === "yes",
        is_trending: data.trending?.toLowerCase() === "yes",
        tags: data.tags
          ? data.tags.split(",").map((t: string) => t.trim())
          : [],
      };

      // Collect images
      const images = [
        data.image_url_1,
        data.image_url_2,
        data.image_url_3,
      ].filter((url): url is string => typeof url === "string" && url !== "");

      validRows.push({ row: rowNum, product, images });
    }

    // If no valid rows, return errors only
    if (validRows.length === 0) {
      return NextResponse.json(
        {
          success: 0,
          failed: validationErrors.length,
          errors: validationErrors,
          message: "No valid rows to import.",
        },
        { status: 422 }
      );
    }

    // Batch insert valid products
    const insertResult = await createProductsBatch(validRows);

    // Merge validation errors with insert errors
    const allErrors = [...validationErrors, ...insertResult.errors];

    return NextResponse.json({
      success: insertResult.success,
      failed: insertResult.failed + validationErrors.length,
      total: rows.length,
      errors: allErrors,
      message: `Imported ${insertResult.success} of ${rows.length} products.`,
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return NextResponse.json(
      { error: "Failed to process file. Please check the format and try again." },
      { status: 500 }
    );
  }
}
