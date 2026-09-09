import { Request, Response, NextFunction } from 'express';
import { docker } from '../services/docker';
import { prisma } from '../index';
import { DockerContainerService, DockerStatsService, DockerLogService } from '../services/docker';

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
    const data = await DockerContainerService.getStatus(id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getContainerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const stats = await DockerStatsService.getStats(id);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

export const startContainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await DockerContainerService.startContainer(id);
    await auditDockerAction((req as any).user!.id, 'DOCKER_START_CONTAINER', id, {}, req);
    res.json({ success: true, message: 'Container started' });
  } catch (error) {
    next(error);
  }
};

export const stopContainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await DockerContainerService.stopContainer(id);
    await auditDockerAction((req as any).user!.id, 'DOCKER_STOP_CONTAINER', id, {}, req);
    res.json({ success: true, message: 'Container stopped' });
  } catch (error) {
    next(error);
  }
};

export const restartContainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await DockerContainerService.restartContainer(id);
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
        const logString = await DockerLogService.getLogs(id, tail);
        res.json({ logs: logString });
    } catch (error) {
        next(error);
    }
}
