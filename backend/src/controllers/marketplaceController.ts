import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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

    const app = await prisma.application.create({
      data: {
        name,
        environmentId,
        sourceType: 'MARKETPLACE',
        imageName: template.image,
        internalPort: template.defaultPort,
        status: 'DEPLOYING',
      }
    });

    // In a real implementation we would use Orchestrator here

    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ error: 'Failed to deploy template' });
  }
};
