"use server";

import { db } from "@/db";
import { sections, venues } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-middleware";

export async function getAllSections() {
  return db.select().from(sections).orderBy(asc(sections.sortOrder));
}

export async function createSection(data: typeof sections.$inferInsert) {
  await requireAdmin();
  const result = await db.insert(sections).values(data).returning();
  revalidatePath("/admin/sections");
  revalidatePath("/admin/venues");
  return result[0];
}

export async function updateSection(id: string, data: Partial<typeof sections.$inferInsert>) {
  await requireAdmin();
  const result = await db.update(sections).set(data).where(eq(sections.id, id)).returning();
  revalidatePath("/admin/sections");
  revalidatePath("/admin/venues");
  return result[0];
}

export async function deleteSection(id: string) {
  await requireAdmin();
  
  // Check if any venues are using this section
  const venuesInSection = await db.select().from(venues).where(eq(venues.section, id)).limit(1);
  if (venuesInSection.length > 0) {
    throw new Error("لا يمكن حذف القسم لوجود قاعات مرتبطة به");
  }

  await db.delete(sections).where(eq(sections.id, id));
  revalidatePath("/admin/sections");
  revalidatePath("/admin/venues");
  return { success: true };
}
