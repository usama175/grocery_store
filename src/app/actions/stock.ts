"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

const stockTakeSchema = z.object({
  productId: z.coerce.number(),
  countedStock: z.coerce.number().min(0, "Counted stock cannot be negative"),
  reason: z.string().optional().nullable(),
});

export async function getRecentStockTakes(limit = 50) {
  return prisma.stockTake.findMany({
    orderBy: { performedAt: "desc" },
    take: limit,
    include: { product: true },
  });
}

export async function recordStockTake(data: {
  productId: number;
  countedStock: number;
  reason?: string | null;
}) {
  const parsed = stockTakeSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message || "Invalid stock take data" };
  }
  const { productId, countedStock, reason } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false as const, error: "Product not found" };

  const expected = parseFloat(product.currentStock.toString());
  const difference = countedStock - expected;

  await prisma.$transaction(async (tx) => {
    await tx.stockTake.create({
      data: {
        productId,
        expectedStock: expected,
        countedStock,
        difference,
        reason: reason?.trim() || "audit reconciliation",
      },
    });
    await tx.product.update({
      where: { id: productId },
      data: { currentStock: countedStock },
    });
  });

  revalidatePath("/stock");
  revalidatePath("/products");
  revalidatePath("/pos");
  revalidatePath("/reports");
  return { ok: true as const, difference };
}

export async function updateStockTake(id: number, data: {
  countedStock: number;
  reason?: string | null;
}) {
  const stockTake = await prisma.stockTake.findUnique({ where: { id } });
  if (!stockTake) return { ok: false as const, error: "Stock take not found" };

  const parsed = stockTakeSchema.safeParse({
    productId: stockTake.productId,
    countedStock: data.countedStock,
    reason: data.reason,
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message || "Invalid stock take data" };
  }

  const { countedStock, reason } = parsed.data;

  // We need to determine how this changes the current stock of the product.
  // The product's current stock was previously adjusted by `stockTake.countedStock`.
  // The new current stock should be: product.currentStock - old_countedStock + new_countedStock
  
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: stockTake.productId } });
    if (!product) throw new Error("Product not found");

    const newCurrentStock = Number(product.currentStock) - Number(stockTake.countedStock) + countedStock;

    // The difference recorded in the stock take is relative to its initial `expectedStock`
    const newDifference = countedStock - Number(stockTake.expectedStock);

    await tx.stockTake.update({
      where: { id },
      data: {
        countedStock,
        difference: newDifference,
        reason: reason?.trim() || "audit reconciliation",
      },
    });

    await tx.product.update({
      where: { id: stockTake.productId },
      data: { currentStock: newCurrentStock },
    });
  });

  revalidatePath("/stock");
  revalidatePath("/products");
  revalidatePath("/pos");
  revalidatePath("/reports");
  return { ok: true as const };
}
