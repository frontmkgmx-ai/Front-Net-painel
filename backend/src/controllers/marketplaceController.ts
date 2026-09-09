import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { deploymentQueue } from '../queues/deploymentQueue';

const prisma = new PrismaClient();

const TEMPLATES = [
  {
    id: 'wordpress',
    name: 'WordPress',
    slug: 'wordpress',
    description: 'The world\'s most popular website builder.',
    category: 'CMS',
    image: 'wordpress:latest',
    defaultPort: 80,
  },
  {
    id: 'ghost',
    name: 'Ghost',
    slug: 'ghost',
    description: 'Turn your audience into a business.',
    category: 'Blog',
    image: 'ghost:latest',
    defaultPort: 2368,
  },
  {
    id: 'n8n',
    name: 'n8n',
    slug: 'n8n',
    description: 'Free and open fair-code licensed node based Workflow Automation Tool.',
    category: 'Automation',
    image: 'n8nio/n8n:latest',
    defaultPort: 5678,
  },
  {
    id: 'nginx',
    name: 'Nginx',
    slug: 'nginx',
    description: 'High performance web server and reverse proxy.',
    category: 'Web Server',
    image: 'nginx:alpine',
    defaultPort: 80,
  }
];

export const getTemplates = (req: Request, res: Response) => {
  res.json(TEMPLATES);
};

export const deployTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId, name, environmentId } = req.body;
    
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    let targetEnvId = environmentId;
    if (!targetEnvId) {
      // Find or create default environment
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
        sourceType: 'MARKETPLACE',
        imageName: template.image,
        internalPort: template.defaultPort,
        status: 'QUEUED',
      }
    });

    const deployment = await prisma.deployment.create({
       data: {
         applicationId: app.id,
         status: 'QUEUED',
         userId: (req as any).user?.id,
       }
    });

    await deploymentQueue.add('deploy', {
        deploymentId: deployment.id,
        applicationId: app.id
    }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    });

    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ error: 'Failed to deploy template' });
  }
};
