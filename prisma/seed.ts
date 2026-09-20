import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding admin user...");
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaUser = (prisma as any).user;
    const firstUser = await prismaUser.findFirst();
    if (firstUser) {
      await prismaUser.update({
        where: { id: firstUser.id },
        data: {
          email: adminEmail,
          password: adminPassword,
          name: "Admin User",
        },
      });
      console.log(`Admin user updated to: ${adminEmail}`);
    } else {
      await prismaUser.create({
        data: {
          email: adminEmail,
          password: adminPassword,
          name: "Admin User",
        },
      });
      console.log(`Admin user created: ${adminEmail}`);
    }
  } else {
    console.log("Skipped seeding admin user: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
  }

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

