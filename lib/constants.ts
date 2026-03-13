export const VENUES_CONFIG = [
  { 
    id: "ground-floor-main", // Stable ID for syncing
    nameAr: "قاعة الاجتماعات الكبرى", 
    section: "ground_floor" as const, 
    capacity: 80, 
    isDouble: false, 
    sortOrder: 1 
  },
  { 
    id: "ground-floor-training",
    nameAr: "قاعة التدريب", 
    section: "ground_floor" as const, 
    capacity: 40, 
    isDouble: false, 
    sortOrder: 2 
  },
  { 
    id: "ground-floor-multi",
    nameAr: "القاعة متعددة الأغراض", 
    section: "ground_floor" as const, 
    capacity: 60, 
    isDouble: false, 
    sortOrder: 3 
  },
  { 
    id: "second-floor-conf",
    nameAr: "قاعة المؤتمرات", 
    section: "second_floor" as const, 
    capacity: 50, 
    isDouble: false, 
    sortOrder: 4 
  },
  { 
    id: "second-floor-youth",
    nameAr: "قاعة الشباب", 
    section: "second_floor" as const, 
    capacity: 35, 
    isDouble: false, 
    sortOrder: 5 
  },
  { 
    id: "second-floor-double",
    nameAr: "القاعة المزدوجة أ+ب", 
    section: "second_floor" as const, 
    capacity: 90, 
    isDouble: true, 
    sortOrder: 6 
  },
  { 
    id: "edu-class-1",
    nameAr: "فصل التعليم ١", 
    section: "education_building" as const, 
    capacity: 25, 
    isDouble: false, 
    sortOrder: 7 
  },
  { 
    id: "edu-class-2",
    nameAr: "فصل التعليم ٢", 
    section: "education_building" as const, 
    capacity: 25, 
    isDouble: false, 
    sortOrder: 8 
  },
  { 
    id: "edu-activity",
    nameAr: "قاعة النشاط", 
    section: "education_building" as const, 
    capacity: 45, 
    isDouble: false, 
    sortOrder: 9 
  },
];
