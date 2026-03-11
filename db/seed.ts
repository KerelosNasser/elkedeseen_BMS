import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log('Seeding venues...');

  const initialVenues: (typeof schema.venues.$inferInsert)[] = [
    // Section: ground_floor (قاعات الأرضي)
    { nameAr: "قاعة الاجتماعات الكبرى", section: "ground_floor", capacity: 80, isDouble: false, sortOrder: 1 },
    { nameAr: "قاعة التدريب", section: "ground_floor", capacity: 40, isDouble: false, sortOrder: 2 },
    { nameAr: "القاعة متعددة الأغراض", section: "ground_floor", capacity: 60, isDouble: false, sortOrder: 3 },
    
    // Section: second_floor (قاعات الدور الثاني)
    { nameAr: "قاعة المؤتمرات", section: "second_floor", capacity: 50, isDouble: false, sortOrder: 4 },
    { nameAr: "قاعة الشباب", section: "second_floor", capacity: 35, isDouble: false, sortOrder: 5 },
    { nameAr: "القاعة المزدوجة أ+ب", section: "second_floor", capacity: 90, isDouble: true, sortOrder: 6 },
    
    // Section: education_building (مبني الخدمة التعليمية)
    { nameAr: "فصل التعليم ١", section: "education_building", capacity: 25, isDouble: false, sortOrder: 7 },
    { nameAr: "فصل التعليم ٢", section: "education_building", capacity: 25, isDouble: false, sortOrder: 8 },
    { nameAr: "قاعة النشاط", section: "education_building", capacity: 45, isDouble: false, sortOrder: 9 },
  ];

  for (const venue of initialVenues) {
    await db.insert(schema.venues).values(venue).onConflictDoNothing();
  }

  console.log('Seed completed successfully.');
}

main().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
