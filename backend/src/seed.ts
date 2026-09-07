import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_INITIAL_USERNAME || 'kdsinn';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_INITIAL_PASSWORD environment variable is required for seeding.');
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    let superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({ data: { name: 'SUPER_ADMIN', description: 'System Administrator' } });
      await prisma.role.create({ data: { name: 'ADMIN', description: 'Administrator' } });
      await prisma.role.create({ data: { name: 'USER', description: 'Standard User' } });
    }

    const hashedPassword = await argon2.hash(adminPassword);
    await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        roleId: superAdminRole.id,
        isActive: true,
      },
    });
    console.log(`Initial admin user '${adminUsername}' created successfully.`);
  } else {
    console.log(`Initial admin user '${adminUsername}' already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
