"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc, ne, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-middleware";

export async function getAllUsers() {
  await requireAdmin();
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    status: users.status,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  const admin = await requireAdmin();

  // Prevent self-demotion to avoid locking yourself out
  if (userId === admin.id && newRole === 'user') {
    throw new Error("لا يمكنك إلغاء صلاحيات الأدمن لنفسك");
  }

  await db.update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserStatus(userId: string, newStatus: 'active' | 'rejected') {
  await requireAdmin();

  await db.update(users)
    .set({ status: newStatus })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}
