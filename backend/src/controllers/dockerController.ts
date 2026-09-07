import { Request, Response, NextFunction } from 'express';
import Docker from 'dockerode';
import { prisma } from '../index';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Middleware/helper to ensure safe docker actions
const auditDockerAction = async (userId: string, action: string, resource: string, details: any, req: Request) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }
  });
};

export const getContainers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const containers = await docker.listContainers({ all: true });
    res.json(containers);
  } catch (error) {
    next(error);
  }
};

export const getContainerInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    const data = await container.inspect();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getContainerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const container = docker.getContainer(id);
        const stats = await container.stats({ stream: false });
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

export const startContainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    await container.start();
    await auditDockerAction((req as any).user!.id, 'DOCKER_START_CONTAINER', id, {}, req);
    res.json({ success: true, message: 'Container started' });
  } catch (error) {
    next(error);
  }
};

export const stopContainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    await container.stop();
    await auditDockerAction((req as any).user!.id, 'DOCKER_STOP_CONTAINER', id, {}, req);
    res.json({ success: true, message: 'Container stopped' });
  } catch (error) {
    next(error);
  }
};

export const restartContainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    await container.restart();
    await auditDockerAction((req as any).user!.id, 'DOCKER_RESTART_CONTAINER', id, {}, req);
    res.json({ success: true, message: 'Container restarted' });
  } catch (error) {
    next(error);
  }
};

export const getContainerLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const tail = req.query.tail ? parseInt(req.query.tail as string) : 100;
        const container = docker.getContainer(id);
        const logs = await container.logs({
            stdout: true,
            stderr: true,
            tail,
            timestamps: true
        });
        // Dockerode returns a buffer, need to parse multiplexed stream
        // For simplicity in JSON, we can return as hex or attempt to clean it. 
        // A simple string conversion might include docker stream headers.
        // We'll strip non-printable characters for a simple implementation.
        const logString = logs.toString('utf-8').replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, "");
        res.json({ logs: logString });
    } catch (error) {
        next(error);
    }
}
