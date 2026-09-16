"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { recordExpenseOutflow } from "@/lib/services/accounts";

const expenseSchema = z.object({
  title: z.string().min(1, "Expense title is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
});

export async function getExpenses(limit = 100) {
  return prisma.expense.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function createExpense(data: {
  title: string;
  category: string;
  amount: number;
  paymentMethod: string;
  notes?: string | null;
  date?: string | null;
}) {
  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message || "Invalid expense data" };
  }
  const d = parsed.data;

  const expenseDate = d.date ? new Date(d.date) : new Date();

  const expense = await prisma.expense.create({
    data: {
      title: d.title.trim(),
      category: d.category,
      amount: d.amount,
      paymentMethod: d.paymentMethod,
      notes: d.notes?.trim() || null,
      date: expenseDate,
    },
  });

  // Record outflow in the account ledger
  await recordExpenseOutflow(
    expense.id,
    d.paymentMethod,
    d.amount,
    d.title
  );

  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/accounts");
  revalidatePath("/");
  return { ok: true as const, expense };
}
