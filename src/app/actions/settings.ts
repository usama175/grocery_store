"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function getStoreSettings() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let settings = await (prisma as any).storeSettings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settings = await (prisma as any).storeSettings.create({
      data: {
        id: 1,
      },
    });
  }

  return settings;
}

export async function updateStoreSettings(data: {
  name: string;
  email: string;
  currency: string;
  timezone: string;
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).storeSettings.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        ...data,
      },
    });

    revalidatePath("/");
    revalidatePath("/settings");
    revalidatePath("/layout");
    
    return { ok: true };
  } catch (error) {
    console.error("Failed to update store settings:", error);
    return { ok: false, error: "Failed to update settings" };
  }
}
