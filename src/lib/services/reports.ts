import { prisma } from "@/lib/db";
import { decimalToNumber } from "@/lib/utils";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export async function getDayEndReport(targetDate: Date | string = new Date()) {
  const d = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  // If invalid date, fallback to today
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const from = startOfDay(validDate);
  const to = endOfDay(validDate);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: {
      items: true,
      payments: true,
    },
  });

  let totalSales = 0;
  let totalCogs = 0;
  const byPayment: Record<string, number> = {
    cash: 0,
    jazzcash: 0,
    easypaisa: 0,
    bank: 0,
    udhaar: 0,
  };

  for (const sale of sales) {
    totalSales += decimalToNumber(sale.netAmount);
    for (const item of sale.items) {
      totalCogs +=
        decimalToNumber(item.purchaseRate) * decimalToNumber(item.quantity);
    }
    for (const p of sale.payments) {
      byPayment[p.method] =
        (byPayment[p.method] ?? 0) + decimalToNumber(p.amount);
    }
  }

  const expenses = await prisma.expense.findMany({
    where: { date: { gte: from, lte: to } },
  });
  const totalExpenses = expenses.reduce(
    (s, e) => s + decimalToNumber(e.amount),
    0
  );

  const grossProfit = totalSales - totalCogs;
  const netProfit = grossProfit - totalExpenses;
  const grossMarginPercent =
    totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : "0";
  const netMarginPercent =
    totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : "0";

  return {
    date: from.toISOString().slice(0, 10),
    saleCount: sales.length,
    totalSales,
    totalCogs,
    grossProfit,
    grossMarginPercent,
    totalExpenses,
    netProfit,
    netMarginPercent,
    byPayment,
  };
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { currentStock: "asc" },
  });
  return products.filter(
    (p) => decimalToNumber(p.currentStock) <= decimalToNumber(p.minStockAlert)
  );
}

export async function getTopSellers(days = 30, limit = 15) {
  const from = new Date();
  from.setDate(from.getDate() - days);

  const grouped = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { createdAt: { gte: from } } },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const productIds = grouped.map((g) => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  return grouped
    .filter((g) => byId.has(g.productId))
    .map((g) => ({
      product: byId.get(g.productId)!,
      quantitySold: decimalToNumber(g._sum.quantity ?? 0),
      totalRevenue: decimalToNumber(g._sum.total ?? 0),
    }));
}
