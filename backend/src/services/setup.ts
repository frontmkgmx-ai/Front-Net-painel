import { prisma } from '../index';
import * as argon2 from 'argon2';

export const setupInitialAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_INITIAL_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (!adminPassword) {
      console.log('Skipping admin setup: ADMIN_INITIAL_PASSWORD is not set.');
      return;
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
  } catch (error) {
    console.error('Failed to setup initial admin:', error);
  }
};
