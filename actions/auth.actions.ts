"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, deleteSession, hashPassword, verifyPassword, getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" };
    }

    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (result.length === 0) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    const user = result[0];
    const isMatched = await verifyPassword(password, user.passwordHash);

    if (!isMatched) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    if (user.status === "rejected") {
      return { success: false, error: "تم رفض طلب عضوية هذا الحساب. يرجى التواصل مع الإدارة." };
    }

    // Role Sync Logic: 
    // - If user is in ADMIN_EMAILS list, ensure they are admin and active.
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
    const shouldBeAdmin = adminEmails.includes(email.toLowerCase());
    
    if (shouldBeAdmin && (user.role !== "admin" || user.status !== "active")) {
      await db.update(users).set({ role: "admin", status: "active" }).where(eq(users.id, user.id));
    }

    await createSession(user.id);
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "حدث خطأ غير متوقع" };
  }
}

export async function registerAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !password || !confirmPassword) {
      return { success: false, error: "جميع الحقول مطلوبة" };
    }

    if (password.length < 8) {
      return { success: false, error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "كلمة المرور وتأكيدها غير متطابقين" };
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "البريد الإلكتروني مستخدم بالفعل" };
    }

    const passwordHash = await hashPassword(password);
    
    // Check if the user is an admin
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes(email.toLowerCase());
    const role = isAdmin ? "admin" : "user";
    const status = isAdmin ? "active" : "pending_approval";

    const insertResult = await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      status,
    }).returning({ id: users.id });

    if (!insertResult.length) {
       return { success: false, error: "فشل إنشاء الحساب" };
    }

    const newUserId = insertResult[0].id;
    await createSession(newUserId);
    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "حدث خطأ أثناء التسجيل" };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await deleteSession();
  } catch (error) {
    console.error("Logout error", error);
  }
  // No error handling needed for logout to the client really, mostly silent.
  revalidatePath("/");
  redirect("/login");
}
