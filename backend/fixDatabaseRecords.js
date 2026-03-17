const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixComplaints() {
  try {
    const officer = await prisma.officer.findUnique({
      where: { officerId: 'POL001' }
    });

    if (officer) {
      console.log('Officer found, ID:', officer.id);
      
      const res = await prisma.complaint.updateMany({
        where: { officerId: null },
        data: { officerId: officer.id }
      });
      
      console.log(`Updated ${res.count} complaints to belong to POL001.`);
    } else {
      console.log('Default officer POL001 not found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

fixComplaints();
