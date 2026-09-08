import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DockerService } from '../services/dockerService';
import crypto from 'crypto';

const prisma = new PrismaClient();

const generatePassword = () => crypto.randomBytes(12).toString('hex');

export const getDatabases = async (req: Request, res: Response) => {
  try {
    const databases = await prisma.databaseService.findMany({
      include: { environment: { include: { project: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    // Check actual docker status for each
    const dbsWithStatus = await Promise.all(databases.map(async (db) => {
      const status = await DockerService.getContainerStatus(`mycloud_db_${db.id}`);
      let currentStatus = db.status;
      if (status) {
        currentStatus = status.Running ? 'RUNNING' : 'STOPPED';
      } else {
        currentStatus = 'NOT_FOUND';
      }
      return { ...db, currentStatus };
    }));
    
    res.json(dbsWithStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch databases' });
  }
};

export const createDatabase = async (req: Request, res: Response) => {
  try {
    const { name, type, version, environmentId } = req.body;
    
    // Auto-generate credentials
    const dbUser = req.body.dbUser || `${type.toLowerCase()}_user_${crypto.randomBytes(4).toString('hex')}`;
    const dbPassword = req.body.dbPassword || generatePassword();
    const dbName = req.body.dbName || name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
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

    const internalPort = type === 'MYSQL' ? 3306 : type === 'POSTGRES' ? 5432 : type === 'MONGODB' ? 27017 : 6379;
    
    const db = await prisma.databaseService.create({
      data: {
        name,
        type,
        version: version || 'latest',
        dbUser,
        dbPassword,
        dbName: type === 'REDIS' ? null : dbName,
        internalPort,
        environmentId: targetEnvId,
        userId: (req as any).user.id,
        status: 'DEPLOYING'
      }
    });
    
    // Async provisioning
    DockerService.createDatabaseContainer(db)
      .then(async () => {
        await prisma.databaseService.update({ where: { id: db.id }, data: { status: 'RUNNING' } });
      })
      .catch(async (err) => {
        console.error('Failed to provision DB:', err);
        await prisma.databaseService.update({ where: { id: db.id }, data: { status: 'ERROR' } });
      });
    
    res.status(201).json(db);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create database' });
  }
};

export const deleteDatabase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await prisma.databaseService.findUnique({ where: { id } });
    if (!db) return res.status(404).json({ error: 'Not found' });
    
    await DockerService.removeContainer(`mycloud_db_${id}`);
    await prisma.databaseService.delete({ where: { id } });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete database' });
  }
};
