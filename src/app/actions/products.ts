"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

const productSchema = z.object({
  barcode: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  categoryId: z.coerce.number().optional().nullable(),
  unit: z.enum(["pcs", "kg", "pack", "liter"]),
  purchaseRate: z.coerce.number().min(0, "Cost price must be positive"),
  saleRate: z.coerce.number().min(0, "Retail price must be positive"),
  currentStock: z.coerce.number().min(0).default(0),
  minStockAlert: z.coerce.number().min(0).default(5),
});

export async function getProducts(search?: string, categoryId?: number) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { barcode: { contains: search } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function upsertCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = await prisma.category.findFirst({
    where: { name: trimmed },
  });
  if (existing) return existing;
  const cat = await prisma.category.create({ data: { name: trimmed } });
  revalidatePath("/products");
  revalidatePath("/pos");
  return cat;
}

export async function createProduct(data: {
  name: string;
  barcode?: string;
  categoryId?: number | null;
  unit: "pcs" | "kg" | "pack" | "liter";
  purchaseRate: number;
  saleRate: number;
  currentStock?: number;
  minStockAlert?: number;
}) {
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0]?.message || "Invalid product data";
    return { ok: false as const, error: err };
  }
  const d = parsed.data;

  // Check unique barcode if provided
  if (d.barcode?.trim()) {
    const dup = await prisma.product.findUnique({
      where: { barcode: d.barcode.trim() },
    });
    if (dup) {
      return { ok: false as const, error: `Barcode ${d.barcode} is already assigned to ${dup.name}` };
    }
  }

  await prisma.product.create({
    data: {
      barcode: d.barcode?.trim() || null,
      name: d.name.trim(),
      categoryId: d.categoryId || null,
      unit: d.unit,
      purchaseRate: d.purchaseRate,
      saleRate: d.saleRate,
      currentStock: d.currentStock,
      minStockAlert: d.minStockAlert,
    },
  });

  revalidatePath("/products");
  revalidatePath("/pos");
  revalidatePath("/reports");
  return { ok: true as const };
}

export async function updateProduct(
  id: number,
  data: {
    name: string;
    barcode?: string;
    categoryId?: number | null;
    unit: "pcs" | "kg" | "pack" | "liter";
    purchaseRate: number;
    saleRate: number;
    minStockAlert?: number;
    currentStock?: number;
  }
) {
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0]?.message || "Invalid product data";
    return { ok: false as const, error: err };
  }
  const d = parsed.data;

  // Check unique barcode if changed
  if (d.barcode?.trim()) {
    const dup = await prisma.product.findFirst({
      where: { barcode: d.barcode.trim(), NOT: { id } },
    });
    if (dup) {
      return { ok: false as const, error: `Barcode ${d.barcode} already in use by ${dup.name}` };
    }
  }

  await prisma.product.update({
    where: { id },
    data: {
      barcode: d.barcode?.trim() || null,
      name: d.name.trim(),
      categoryId: d.categoryId || null,
      unit: d.unit,
      purchaseRate: d.purchaseRate,
      saleRate: d.saleRate,
      minStockAlert: d.minStockAlert,
      ...(d.currentStock !== undefined ? { currentStock: d.currentStock } : {}),
    },
  });

  revalidatePath("/products");
  revalidatePath("/pos");
  revalidatePath("/reports");
  return { ok: true as const };
}

export async function deactivateProduct(id: number) {
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/products");
  revalidatePath("/pos");
  return { ok: true as const };
}
