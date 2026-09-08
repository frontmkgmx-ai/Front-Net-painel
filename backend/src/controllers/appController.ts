import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getApps = async (req: Request, res: Response) => {
  try {
    const apps = await prisma.application.findMany({
      include: { environment: { include: { project: true } } },
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
};

export const createApp = async (req: Request, res: Response) => {
  try {
    const { name, environmentId, sourceType, gitRepoUrl, gitBranch } = req.body;
    const app = await prisma.application.create({
      data: {
        name,
        environmentId,
        sourceType,
        gitRepoUrl,
        gitBranch,
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
    const app = await prisma.application.update({
      where: { id },
      data: { status: 'DEPLOYING' }
    });
    
    // Trigger orchestrator deployment here...
    
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: 'Failed to deploy app' });
  }
};
