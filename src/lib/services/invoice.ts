import { prisma } from "@/lib/db";

export async function nextInvoiceNumber(): Promise<string> {
  const today = new Date();
  const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const count = await prisma.sale.count({
    where: {
      invoiceNumber: { startsWith: prefix },
    },
  });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}
