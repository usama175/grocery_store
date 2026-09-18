"use server";

import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return { error: "Invalid credentials" };
    }

    await createSession(email);
  } catch (error) {
    console.error("Login Error:", error);
    return { error: "Database connection failed or table does not exist." };
  }
  
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
