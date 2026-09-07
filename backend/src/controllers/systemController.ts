import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import os from 'os';

export const getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = {
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        loadavg: os.loadavg(),
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
      },
      os: {
        platform: os.platform(),
        release: os.release(),
        uptime: os.uptime(),
        hostname: os.hostname(),
        arch: os.arch()
      },
      app: {
        uptime: process.uptime(),
        nodeVersion: process.version,
      }
    };
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true } }
      }
    });

    const total = await prisma.auditLog.count();

    res.json({ logs, total });
  } catch (error) {
    next(error);
  }
};
