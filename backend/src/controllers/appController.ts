import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DockerContainerService } from '../services/docker';
import { deploymentQueue } from '../queues/deploymentQueue';

const prisma = new PrismaClient();

export const getApps = async (req: Request, res: Response) => {
  try {
    const apps = await prisma.application.findMany({
      include: { environment: { include: { project: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const appsWithStatus = await Promise.all(apps.map(async (app) => {
      const status = await DockerContainerService.getStatus(`mycloud_app_${app.id}`);
      let currentStatus = app.status;
      if (status) {
        currentStatus = status.Running ? 'RUNNING' : 'STOPPED';
      } else {
        currentStatus = 'NOT_FOUND';
      }
      return { ...app, currentStatus };
    }));
    
    res.json(appsWithStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
};

export const createApp = async (req: Request, res: Response) => {
  try {
    const { name, environmentId, sourceType, gitRepoUrl, gitBranch, imageName, startCmd, internalPort } = req.body;
    let targetEnvId = environmentId;
    if (!targetEnvId) {
      let defaultProj = await prisma.project.findFirst({ where: { name: 'Default Project' } });
      if (!defaultProj) {
        defaultProj = await prisma.project.create({ data: { name: 'Default Project' } });
      }
      let defaultEnv = await prisma.environment.findFirst({ where: { projectId: defaultProj.id } });
      if (!defaultEnv) {
        defaultEnv = await prisma.environment.create({ data: { name: 'Production', projectId: defaultProj.id } });
      }
      targetEnvId = defaultEnv.id;
    }
    const app = await prisma.application.create({
      data: {
        name,
        environmentId: targetEnvId,
        sourceType,
        gitRepoUrl,
        gitBranch,
        imageName,
        startCmd,
        internalPort,
        status: 'STOPPED'
      }
    });
    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create app' });
  }
};

export const deployApp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const app = await prisma.application.findUnique({ where: { id } });
    
    if (!app) {
       return res.status(404).json({ error: 'App not found' });
    }

    const deployment = await prisma.deployment.create({
       data: {
         applicationId: id,
         status: 'QUEUED',
         userId: (req as any).user?.id,
       }
    });

    await prisma.application.update({
      where: { id },
      data: { status: 'QUEUED' }
    });

    await deploymentQueue.add('deploy', {
        deploymentId: deployment.id,
        applicationId: id
    }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    });

    res.json({ message: 'Deployment queued successfully', deploymentId: deployment.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to queue deployment' });
  }
};

export const startApp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DockerContainerService.startContainer(`mycloud_app_${id}`);
    await prisma.application.update({ where: { id }, data: { status: 'RUNNING' } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start app' });
  }
};

export const stopApp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DockerContainerService.stopContainer(`mycloud_app_${id}`);
    await prisma.application.update({ where: { id }, data: { status: 'STOPPED' } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop app' });
  }
};

export const deleteApp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DockerContainerService.removeContainer(`mycloud_app_${id}`);
    await prisma.application.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete app' });
  }
};

export const getDeployments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deployments = await prisma.deployment.findMany({
       where: { applicationId: id },
       orderBy: { createdAt: 'desc' }
    });
    res.json(deployments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deployments' });
  }
};
