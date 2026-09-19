"use server";

import { prisma } from "@/lib/db";

export async function getSalesReport(startDate?: Date, endDate?: Date) {
  const whereClause = {
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const sales = await prisma.sale.findMany({
    where: whereClause,
    include: {
      customer: true,
      items: {
        include: { product: true }
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" }
  });

  return sales;
}

export async function getExpenseReport(startDate?: Date, endDate?: Date) {
  const whereClause = {
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const expenses = await prisma.expense.findMany({
    where: whereClause,
    orderBy: { date: "desc" }
  });

  return expenses;
}

export async function getStockReport(startDate?: Date, endDate?: Date) {
  const whereClause = {
    ...(startDate || endDate
      ? {
          performedAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const takes = await prisma.stockTake.findMany({
    where: whereClause,
    include: { product: true },
    orderBy: { performedAt: "desc" }
  });

  return takes;
}

export async function getCustomerReport() {
  const customers = await prisma.customer.findMany({
    include: {
      sales: {
        select: { netAmount: true }
      }
    },
    orderBy: { name: "asc" }
  });

  return customers;
}

export async function getAccountReport(startDate?: Date, endDate?: Date) {
  const whereClause = {
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const txns = await prisma.accountTransaction.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" }
  });

  return txns;
}
