export const SECTIONS_MAP = {
  ground_floor: "قاعات الدور الأرضي",
  second_floor: "قاعات الدور الثاني",
  education_building: "المبنى التاني",
  dev_center: "قاعات مركز التنمية",
  other: "قاعات أخرى",
} as const;

export const VENUES_CONFIG = [
  // Section: ground_floor
  { 
    id: "ground-floor-main", 
    nameAr: "القاعة الاولى", 
    section: "ground_floor" as const, 
    capacity: 120, 
    isDouble: false, 
    sortOrder: 1 
  },
  { 
    id: "ground-floor-training",
    nameAr: "القاعة الثانية", 
    section: "ground_floor" as const, 
    capacity: 120, 
    isDouble: false, 
    sortOrder: 2 
  },
  { 
    id: "ground-floor-multi",
    nameAr: "القاعة الاخيرة", 
    section: "ground_floor" as const, 
    capacity: 120, 
    isDouble: false, 
    sortOrder: 3 
  },

  // Section: second_floor
  { 
    id: "second-floor-conf",
    nameAr: "القاعة الاخيرة", 
    section: "second_floor" as const, 
    capacity: 20, 
    isDouble: false, 
    sortOrder: 4 
  },
  { 
    id: "second-floor-youth",
    nameAr: "القاعة التانية", 
    section: "second_floor" as const, 
    capacity: 15, 
    isDouble: false, 
    sortOrder: 5 
  },
  { 
    id: "second-floor-double",
    nameAr: "القاعة المزدوجة أ+ب", 
    section: "second_floor" as const, 
    capacity: 40, 
    isDouble: true, 
    sortOrder: 6 
  },

  // Section: education_building
  { 
    id: "edu-class-1",
    nameAr: "الدور التامن", 
    section: "education_building" as const, 
    capacity: 300, 
    isDouble: false, 
    sortOrder: 7 
  },
  { 
    id: "edu-class-2",
    nameAr: "كنيسة الشهداء", 
    section: "education_building" as const, 
    capacity: 200, 
    isDouble: false, 
    sortOrder: 8 
  },

  // Section: dev_center
  { 
    id: "dev-center-hall-1",
    nameAr: "القاعة الكبيرة", 
    section: "dev_center" as const, 
    capacity: 20, 
    isDouble: false, 
    sortOrder: 10 
  },

  { 
    id: "dev-center-hall-2",
    nameAr: "القاعة الوسط", 
    section: "dev_center" as const, 
    capacity: 10, 
    isDouble: false, 
    sortOrder: 11 
  },
  { 
    id: "dev-center-hall-3",
    nameAr: "القاعة الصغيرة", 
    section: "dev_center" as const, 
    capacity: 5, 
    isDouble: false, 
    sortOrder: 12 
  },
  { 
    id: "other-hall-1",
    nameAr: "القاعة جمب الاذاعة", 
    section: "other" as const, 
    capacity: 20, 
    isDouble: false, 
    sortOrder: 13 
  },
];
