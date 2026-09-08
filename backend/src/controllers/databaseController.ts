import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Docker from 'dockerode';

const prisma = new PrismaClient();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export const getDatabases = async (req: Request, res: Response) => {
  try {
    const databases = await prisma.databaseService.findMany({
      include: { environment: { include: { project: true } } },
    });
    res.json(databases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch databases' });
  }
};

export const createDatabase = async (req: Request, res: Response) => {
  try {
    const { name, type, version, dbUser, dbPassword, dbName, environmentId } = req.body;
    
    // In a real implementation we would dynamically find an available port
    const internalPort = type === 'MYSQL' ? 3306 : type === 'POSTGRES' ? 5432 : type === 'MONGODB' ? 27017 : 6379;
    
    const db = await prisma.databaseService.create({
      data: {
        name,
        type,
        version: version || 'latest',
        dbUser,
        dbPassword,
        dbName,
        internalPort,
        environmentId,
        userId: (req as any).user.id,
        status: 'DEPLOYING'
      }
    });
    
    // We would use Orchestrator to start the docker container here.
    // For now we just return the created DB.
    
    res.status(201).json(db);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create database' });
  }
};
