"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { nextInvoiceNumber } from "@/lib/services/invoice";
import { recordSalePaymentInflows } from "@/lib/services/accounts";

const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().positive(),
});

const paymentSchema = z.object({
  method: z.string(),
  amount: z.number().positive(),
  referenceId: z.string().optional(),
});

const checkoutSchema = z.object({
  customerId: z.number().nullable(),
  discountAmount: z.number().min(0).default(0),
  items: z.array(cartItemSchema).min(1),
  payments: z.array(paymentSchema).min(1),
});

export async function checkout(input: z.infer<typeof checkoutSchema>) {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid checkout data" };
  }
  const { customerId, discountAmount, items, payments } = parsed.data;

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  if (products.length !== productIds.length) {
    return { ok: false as const, error: "One or more products not found" };
  }
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const p = productMap.get(item.productId)!;
    if (parseFloat(p.currentStock.toString()) < item.quantity) {
      return {
        ok: false as const,
        error: `Insufficient stock for ${p.name}`,
      };
    }
  }

  let totalAmount = 0;
  let totalCogs = 0;
  const lineItems = items.map((item) => {
    const p = productMap.get(item.productId)!;
    const purchaseRate = parseFloat(p.purchaseRate.toString());
    const saleRate = parseFloat(p.saleRate.toString());
    const lineTotal = saleRate * item.quantity;
    totalAmount += lineTotal;
    totalCogs += purchaseRate * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      purchaseRate,
      saleRate,
      total: lineTotal,
    };
  });

  const netAmount = Math.max(0, totalAmount - discountAmount);
  const paidTotal = payments.reduce((s, p) => s + p.amount, 0);
  if (Math.abs(paidTotal - netAmount) > 0.01) {
    return {
      ok: false as const,
      error: `Payment total (${paidTotal}) must equal net amount (${netAmount})`,
    };
  }

  const hasUdhaar = payments.some((p) => p.method === "udhaar");
  if (hasUdhaar && !customerId) {
    return {
      ok: false as const,
      error: "Select a customer for credit (Udhaar) sales",
    };
  }

  const invoiceNumber = await nextInvoiceNumber();

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        invoiceNumber,
        customerId,
        totalAmount,
        discountAmount,
        netAmount,
        items: { create: lineItems },
        payments: {
          create: payments.map((p) => ({
            method: p.method,
            amount: p.amount,
            referenceId: p.referenceId ?? null,
          })),
        },
      },
      include: { payments: true },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          currentStock: {
            decrement: item.quantity,
          },
        },
      });
    }

    if (customerId) {
      const udhaarAmount = payments
        .filter((p) => p.method === "udhaar")
        .reduce((s, p) => s + p.amount, 0);
      if (udhaarAmount > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { balance: { increment: udhaarAmount } },
        });
      }
    }

    return created;
  });

  await recordSalePaymentInflows(
    sale.id,
    payments.map((p) => ({
      method: p.method,
      amount: p.amount,
      referenceId: p.referenceId,
    })),
  );

  revalidatePath("/pos");
  revalidatePath("/reports");
  revalidatePath("/accounts");
  revalidatePath("/customers");

  return {
    ok: true as const,
    sale: {
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      netAmount: parseFloat(sale.netAmount.toString()),
      totalCogs,
    },
  };
}
