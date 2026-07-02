import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import { brands } from "./seed-data/brands";
import { categories } from "./seed-data/categories";
import { dosageForms } from "./seed-data/dosage-forms";
import { genericDrugs } from "./seed-data/generic-drugs";
import { productClassifications } from "./seed-data/product-classifications";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

type SeedItem = {
  name: string;
  description?: string;
};

const seedCategories = async (items: SeedItem[]) => {
  console.log("Seeding categories...");

  for (const item of items) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: item.name,
        parentId: null,
      },
      select: {
        id: true,
      },
    });

    if (existingCategory) {
      await prisma.category.update({
        where: {
          id: existingCategory.id,
        },
        data: {
          description: item.description ?? null,
          isActive: true,
        },
      });

      continue;
    }

    await prisma.category.create({
      data: {
        name: item.name,
        description: item.description ?? null,
      },
    });
  }

  console.log(`Seeded ${items.length} categories.`);
};

const seedProductClassifications = async (items: SeedItem[]) => {
  console.log("Seeding product classifications...");

  for (const item of items) {
    await prisma.productClassification.upsert({
      where: {
        name: item.name,
      },
      update: {
        description: item.description ?? null,
        isActive: true,
      },
      create: {
        name: item.name,
        description: item.description ?? null,
      },
    });
  }

  console.log(`Seeded ${items.length} product classifications.`);
};

const seedDosageForms = async (items: SeedItem[]) => {
  console.log("Seeding dosage forms...");

  for (const item of items) {
    await prisma.dosageForm.upsert({
      where: {
        name: item.name,
      },
      update: {
        description: item.description ?? null,
        isActive: true,
      },
      create: {
        name: item.name,
        description: item.description ?? null,
      },
    });
  }

  console.log(`Seeded ${items.length} dosage forms.`);
};

const seedGenericDrugs = async (items: SeedItem[]) => {
  console.log("Seeding generic drugs...");

  for (const item of items) {
    await prisma.genericDrug.upsert({
      where: {
        name: item.name,
      },
      update: {
        description: item.description ?? null,
        isActive: true,
      },
      create: {
        name: item.name,
        description: item.description ?? null,
      },
    });
  }

  console.log(`Seeded ${items.length} generic drugs.`);
};

const seedBrands = async (items: SeedItem[]) => {
  console.log("Seeding brands...");

  for (const item of items) {
    await prisma.brand.upsert({
      where: {
        name: item.name,
      },
      update: {
        description: item.description ?? null,
        isActive: true,
      },
      create: {
        name: item.name,
        description: item.description ?? null,
      },
    });
  }

  console.log(`Seeded ${items.length} brands.`);
};

const seedAdminUser = async () => {
  console.log("Seeding admin user...");

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@botika.local",
    },
    update: {
      passwordHash,
      displayName: "Administrator",
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: "admin@botika.local",
      passwordHash,
      displayName: "Administrator",
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Seeded admin user.");
};

const main = async () => {
  console.log("Starting master reference data seed...");

  await seedAdminUser();
  await seedCategories(categories);
  await seedProductClassifications(productClassifications);
  await seedDosageForms(dosageForms);
  await seedGenericDrugs(genericDrugs);
  await seedBrands(brands);

  console.log("Master reference data seed completed.");
};

main()
  .catch((error: unknown) => {
    console.error("Master reference data seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
