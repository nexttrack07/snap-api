import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CATEGORIES = ["Headlines", "Features", "Bullets", "Callouts"];

async function populate() {
  // populate the categories
  for (const categoryName of CATEGORIES) {
    await prisma.blockCategory.create({
      data: {
        name: categoryName,
      },
    });
  }
  console.log("Categories populated");
}

populate()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
