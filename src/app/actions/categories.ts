"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
});

export async function saveCategory(prevState: unknown, formData: FormData) {
  const data = {
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    name: formData.get("name") as string,
  };

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const { id, name } = parsed.data;

  try {
    if (id) {
      await prisma.category.update({
        where: { id },
        data: { name },
      });
    } else {
      await prisma.category.create({
        data: { name },
      });
    }

    revalidatePath("/categories");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to save category." };
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/categories");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to delete category. It might be linked to products." };
  }
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });
  return categories;
}
