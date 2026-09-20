"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

const supplierSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export async function saveSupplier(prevState: unknown, formData: FormData) {
  const data = {
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    name: formData.get("name") as string,
    contactPerson: formData.get("contactPerson") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    isActive: formData.get("isActive") === "on",
  };

  const parsed = supplierSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const { id, ...supplierData } = parsed.data;

  try {
    if (id) {
      await prisma.supplier.update({
        where: { id },
        data: supplierData,
      });
    } else {
      await prisma.supplier.create({
        data: supplierData,
      });
    }

    revalidatePath("/suppliers");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to save supplier." };
  }
}

export async function deleteSupplier(id: number) {
  try {
    await prisma.supplier.delete({
      where: { id },
    });
    revalidatePath("/suppliers");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to delete supplier." };
  }
}

export async function getSuppliers() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' }
  });
  return suppliers;
}
