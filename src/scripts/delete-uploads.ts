import  { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function deleteAll() {
    await prisma.upload.deleteMany({});
    console.log('All uploads deleted');
}

deleteAll()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
