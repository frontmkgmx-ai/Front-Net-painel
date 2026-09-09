import { Request, Response } from 'express';
import { PrismaClient, DatabaseService } from '@prisma/client';
import { DockerContainerService, DockerImageService, DockerNetworkService } from '../services/docker';
import crypto from 'crypto';

const prisma = new PrismaClient();
const generatePassword = () => crypto.randomBytes(12).toString('hex');

const getDbImage = (type: string, version: string | null) => {
  const v = version || 'latest';
  switch (type) {
    case 'MYSQL': return `mysql:${v}`;
    case 'POSTGRES': return `postgres:${v}`;
    case 'MONGODB': return `mongo:${v}`;
    case 'REDIS': return `redis:${v}-alpine`;
    case 'MARIADB': return `mariadb:${v}`;
    default: throw new Error(`Unsupported DB type: ${type}`);
  }
};

const getDbEnvVars = (db: DatabaseService): Record<string, string> => {
  switch (db.type) {
    case 'MYSQL': return { MYSQL_ROOT_PASSWORD: db.dbPassword, MYSQL_DATABASE: db.dbName || '', MYSQL_USER: db.dbUser, MYSQL_PASSWORD: db.dbPassword };
    case 'POSTGRES': return { POSTGRES_PASSWORD: db.dbPassword, POSTGRES_DB: db.dbName || '', POSTGRES_USER: db.dbUser };
    case 'MONGODB': return { MONGO_INITDB_ROOT_USERNAME: db.dbUser, MONGO_INITDB_ROOT_PASSWORD: db.dbPassword, MONGO_INITDB_DATABASE: db.dbName || '' };
    case 'REDIS': return {}; // Passed via Cmd
    case 'MARIADB': return { MARIADB_ROOT_PASSWORD: db.dbPassword, MARIADB_DATABASE: db.dbName || '', MARIADB_USER: db.dbUser, MARIADB_PASSWORD: db.dbPassword };
    default: return {};
  }
};

export const getDatabases = async (req: Request, res: Response) => {
  try {
    const databases = await prisma.databaseService.findMany({
      include: { environment: { include: { project: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const dbsWithStatus = await Promise.all(databases.map(async (db) => {
      const status = await DockerContainerService.getStatus(`mycloud_db_${db.id}`);
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
    
    const dbUser = req.body.dbUser || `${type.toLowerCase()}_user_${crypto.randomBytes(4).toString('hex')}`;
    const dbPassword = req.body.dbPassword || generatePassword();
    const dbName = req.body.dbName || name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
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
    (async () => {
      try {
        const imageName = getDbImage(db.type, db.version);
        await DockerImageService.pullImage(imageName);
        await DockerNetworkService.ensureNetwork('mycloud_apps');
        
        let Cmd: string[] | undefined = undefined;
        if (db.type === 'REDIS') {
          Cmd = ['redis-server', '--requirepass', db.dbPassword];
        }

        const container = await DockerContainerService.createContainer({
          imageName,
          containerName: `mycloud_db_${db.id}`,
          envVars: getDbEnvVars(db),
          startCmd: Cmd,
          networkMode: 'mycloud_apps',
          memoryLimitMB: db.memoryLimit || undefined,
        });

        await container.start();
        await prisma.databaseService.update({ where: { id: db.id }, data: { status: 'RUNNING' } });
      } catch (err) {
        console.error('Failed to provision DB:', err);
        await prisma.databaseService.update({ where: { id: db.id }, data: { status: 'ERROR' } });
      }
    })();
    
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
    
    await DockerContainerService.removeContainer(`mycloud_db_${id}`);
    await prisma.databaseService.delete({ where: { id } });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete database' });
  }
};
