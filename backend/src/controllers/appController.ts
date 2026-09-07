import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      include: { environments: true }
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: { name, description }
    });
    // Create default environments
    await prisma.environment.createMany({
      data: [
        { projectId: project.id, name: 'Production' },
        { projectId: project.id, name: 'Staging' }
      ]
    });
    await prisma.auditLog.create({
      data: { userId: (req as any).user!.id, action: 'CREATE_PROJECT', resource: project.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { environmentId } = req.query;
    const where = environmentId ? { environmentId: String(environmentId) } : {};
    const apps = await prisma.application.findMany({ where, include: { domains: true } });
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { environmentId, name, sourceType, imageName, gitRepoUrl } = req.body;
    const app = await prisma.application.create({
      data: { environmentId, name, sourceType, imageName, gitRepoUrl }
    });
    await prisma.auditLog.create({
      data: { userId: (req as any).user!.id, action: 'CREATE_APPLICATION', resource: app.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    });
    res.json(app);
  } catch (error) {
    next(error);
  }
};

export const deployApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Mocking the deployment process in the DB
    const deployment = await prisma.deployment.create({
      data: {
        applicationId: id,
        userId: (req as any).user!.id,
        status: 'PENDING',
        logs: 'Deployment queued...\n'
      }
    });

    // In a real scenario, we'd add this to a BullMQ queue here.
    // For now, update state to show the architecture exists.
    await prisma.application.update({
      where: { id },
      data: { status: 'DEPLOYING' }
    });
    
    await prisma.auditLog.create({
      data: { userId: (req as any).user!.id, action: 'DEPLOY_APPLICATION', resource: id, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({ success: true, deploymentId: deployment.id, message: 'Deployment triggered' });
  } catch (error) {
    next(error);
  }
};
