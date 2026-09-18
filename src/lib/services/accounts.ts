import { prisma } from "@/lib/db";
import type { PaymentMethod } from "@/lib/constants";

const LEDGER_METHODS = new Set<PaymentMethod>([
  "cash",
  "jazzcash",
  "easypaisa",
  "bank",
]);

export async function recordSalePaymentInflows(
  saleId: number,
  payments: { method: string; amount: number; referenceId?: string | null }[],
) {
  for (const p of payments) {
    if (!LEDGER_METHODS.has(p.method as PaymentMethod)) continue;
    await prisma.accountTransaction.create({
      data: {
        accountType: p.method,
        transactionType: "inflow",
        amount: p.amount,
        description: `Sale payment${p.referenceId ? ` (${p.referenceId})` : ""}`,
        referenceSaleId: saleId,
      },
    });
  }
}

export async function recordExpenseOutflow(
  expenseId: number,
  paymentMethod: string,
  amount: number,
  title: string,
) {
  if (!LEDGER_METHODS.has(paymentMethod as PaymentMethod)) return;
  await prisma.accountTransaction.create({
    data: {
      accountType: paymentMethod,
      transactionType: "outflow",
      amount,
      description: `Expense: ${title}`,
      referenceExpenseId: expenseId,
    },
  });
}

export async function getAccountBalances() {
  const txns = await prisma.accountTransaction.groupBy({
    by: ["accountType"],
    _sum: { amount: true },
  });

  const inflows = await prisma.accountTransaction.groupBy({
    by: ["accountType"],
    where: { transactionType: "inflow" },
    _sum: { amount: true },
  });

  const outflows = await prisma.accountTransaction.groupBy({
    by: ["accountType"],
    where: { transactionType: "outflow" },
    _sum: { amount: true },
  });

  const balanceMap = new Map<string, number>();
  for (const row of inflows) {
    balanceMap.set(
      row.accountType,
      parseFloat(row._sum.amount?.toString() ?? "0"),
    );
  }
  for (const row of outflows) {
    const current = balanceMap.get(row.accountType) ?? 0;
    balanceMap.set(
      row.accountType,
      current - parseFloat(row._sum.amount?.toString() ?? "0"),
    );
  }

  void txns;
  return balanceMap;
}

export async function getLedgerSummary() {
  const balances = await getAccountBalances();
  const recent = await prisma.accountTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return { balances: Object.fromEntries(balances), recent };
}
