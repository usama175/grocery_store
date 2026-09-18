"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAccountBalances } from "@/lib/services/accounts";

const transferSchema = z.object({
  fromAccount: z.string().min(1, "Source account required"),
  toAccount: z.string().min(1, "Destination account required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  description: z.string().optional().nullable(),
});



export async function internalTransfer(data: {
  fromAccount: string;
  toAccount: string;
  amount: number;
  description?: string | null;
}) {
  const parsed = transferSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message || "Invalid transfer data" };
  }
  const { fromAccount, toAccount, amount, description } = parsed.data;

  if (fromAccount === toAccount) {
    return { ok: false as const, error: "Source and destination accounts must be different" };
  }

  // Check balance of fromAccount
  const balances = await getAccountBalances();
  const available = balances.get(fromAccount) ?? 0;
  if (available < amount) {
    return {
      ok: false as const,
      error: `Insufficient balance in ${fromAccount}. Available: Rs ${available.toFixed(2)}, Requested: Rs ${amount.toFixed(2)}`,
    };
  }

  const note = description?.trim() || `Internal transfer: ${fromAccount} → ${toAccount}`;

  await prisma.$transaction([
    prisma.accountTransaction.create({
      data: {
        accountType: fromAccount,
        transactionType: "outflow",
        amount,
        description: note,
      },
    }),
    prisma.accountTransaction.create({
      data: {
        accountType: toAccount,
        transactionType: "inflow",
        amount,
        description: note,
      },
    }),
  ]);

  revalidatePath("/accounts");
  revalidatePath("/");
  revalidatePath("/reports");
  return { ok: true as const };
}
