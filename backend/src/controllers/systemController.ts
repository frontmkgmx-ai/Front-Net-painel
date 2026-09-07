import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import os from 'os';
import si from 'systeminformation';

export const getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [cpu, mem, osInfo, currentLoad, fsSize, networkStats] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.currentLoad(),
      si.fsSize(),
      si.networkStats()
    ]);

    const stats = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed,
        load: currentLoad.currentLoad,
        loadavg: os.loadavg(),
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        active: mem.active,
        available: mem.available,
        swapTotal: mem.swaptotal,
        swapUsed: mem.swapused,
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        kernel: osInfo.kernel,
        arch: osInfo.arch,
        hostname: osInfo.hostname,
        uptime: os.uptime(), // System uptime
      },
      disk: fsSize.map(d => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        available: d.available,
        use: d.use,
        mount: d.mount,
      })),
      network: networkStats.map(n => ({
        iface: n.iface,
        rx_bytes: n.rx_bytes,
        tx_bytes: n.tx_bytes,
        rx_sec: n.rx_sec,
        tx_sec: n.tx_sec,
      })),
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
    
    // Add filtering
    const { action, userId } = req.query;
    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true } }
      }
    });

    const total = await prisma.auditLog.count({ where });

    res.json({ logs, total });
  } catch (error) {
    next(error);
  }
};
