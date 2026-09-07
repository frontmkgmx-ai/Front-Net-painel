import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ 
      where: { username },
      include: { role: true }
    });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or inactive user' });
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role?.name || 'USER' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: req.ip,
      }
    });

    res.json({ token, user: { id: user.id, username: user.username, role: user.role?.name || 'USER' } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
    
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'LOGOUT',
        ipAddress: req.ip,
      }
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6)
    }).parse(req.body);

    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await argon2.verify(user.password, currentPassword);
    if (!valid) return res.status(400).json({ message: 'Invalid current password' });

    const hashedPassword = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    await prisma.session.deleteMany({ where: { userId } }); // Revoke all sessions

    await prisma.auditLog.create({
      data: { userId, action: 'CHANGE_PASSWORD', ipAddress: req.ip }
    });

    res.json({ message: 'Password changed successfully. All other sessions revoked.' });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: { id: true, username: true, role: { select: { name: true } }, isActive: true }
    });
    res.json({ ...user, role: user?.role?.name || 'USER' });
  } catch (error) {
    next(error);
  }
};
