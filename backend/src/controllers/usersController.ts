import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import * as argon2 from 'argon2';
import { z } from 'zod';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, isActive: true, role: { select: { name: true } }, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users.map(u => ({ ...u, role: u.role?.name || 'USER' })));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, roleName } = z.object({
      username: z.string(),
      password: z.string().min(6),
      roleName: z.string()
    }).parse(req.body);

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return res.status(400).json({ message: 'Invalid role' });

    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        roleId: role.id
      }
    });

    await prisma.auditLog.create({
      data: { userId: (req as any).user.id, action: 'CREATE_USER', details: { targetUserId: user.id } }
    });

    res.json({ id: user.id, username: user.username, role: role.name });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: { userId: (req as any).user.id, action: 'DELETE_USER', details: { targetUserId: id } }
    });

    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
