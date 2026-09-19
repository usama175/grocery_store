"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export async function getCustomers(search?: string) {
  return prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  });
}

export async function createCustomer(data: {
  name: string;
  phone?: string | null;
  address?: string | null;
}) {
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message || "Invalid customer data" };
  }

  const { name, phone, address } = parsed.data;

  // Check unique phone if provided
  if (phone?.trim()) {
    const dup = await prisma.customer.findUnique({
      where: { phone: phone.trim() },
    });
    if (dup) {
      return { ok: false as const, error: `Customer with phone ${phone} already exists (${dup.name})` };
    }
  }

  const customer = await prisma.customer.create({
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    },
  });

  revalidatePath("/customers");
  revalidatePath("/pos");
  return { ok: true as const, customer };
}

export async function updateCustomer(id: number, data: {
  name: string;
  phone?: string | null;
  address?: string | null;
  balance?: number;
}) {
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message || "Invalid customer data" };
  }

  const { name, phone, address } = parsed.data;

  if (phone?.trim()) {
    const dup = await prisma.customer.findFirst({
      where: { phone: phone.trim(), id: { not: id } },
    });
    if (dup) {
      return { ok: false as const, error: `Customer with phone ${phone} already exists (${dup.name})` };
    }
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      ...(data.balance !== undefined ? { balance: data.balance } : {}),
    },
  });

  revalidatePath("/customers");
  revalidatePath("/customers/[id]", "page");
  revalidatePath("/pos");
  return { ok: true as const, customer };
}

export async function receivePayment({
  customerId,
  amount,
  accountType = "cash",
  referenceId,
}: {
  customerId: number;
  amount: number;
  accountType?: string;
  referenceId?: string;
}) {
  if (amount <= 0) return { ok: false as const, error: "Payment amount must be greater than zero" };

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) return { ok: false as const, error: "Customer not found" };

  const channel = accountType || "cash";
  const refNote = referenceId ? ` (TID/Ref: ${referenceId})` : "";

  await prisma.$transaction(async (tx) => {
    // Decrement customer's credit balance
    await tx.customer.update({
      where: { id: customerId },
      data: { balance: { decrement: amount } },
    });

    // Inflow to designated account ledger
    await tx.accountTransaction.create({
      data: {
        accountType: channel,
        transactionType: "inflow",
        amount,
        description: `Khata dues received from ${customer.name}${refNote}`,
      },
    });
  });

  revalidatePath("/customers");
  revalidatePath("/customers/[id]", "page");
  revalidatePath("/accounts");
  revalidatePath("/pos");
  revalidatePath("/reports");
  return { ok: true as const };
}

export async function getCustomerWithSales(customerId: number) {
  return prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } }, payments: true },
        take: 50,
      },
    },
  });
}
