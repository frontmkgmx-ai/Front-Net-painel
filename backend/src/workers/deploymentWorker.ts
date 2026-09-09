import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../index';
import { DockerContainerService, DockerImageService, DockerNetworkService } from '../services/docker';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null
});

export const deploymentWorker = new Worker('deployments', async (job: Job) => {
  const { deploymentId, applicationId } = job.data;

  // Mark as running
  await prisma.deployment.update({
    where: { id: deploymentId },
    data: { 
      status: 'RUNNING', 
      jobId: job.id,
      startedAt: new Date(),
      logs: 'Starting deployment...\n'
    }
  });
  
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'DEPLOYING' }
  });


  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { envs: true, volumes: true }
    });

    if (!app) throw new Error('Application not found');
    
    // Simulate concatenation (Prisma requires reading and writing for string append, or raw SQL)
    const log = (msg: string) => prisma.$executeRawUnsafe(
      `UPDATE Deployment SET logs = CONCAT(IFNULL(logs, ''), ?) WHERE id = ?`, 
      msg + '\n', deploymentId
    );

    await log('Fetching application configuration...');

    const imageName = app.imageName || 'alpine';
    await log(`Pulling image ${imageName}...`);
    
    await DockerImageService.pullImage(imageName);
    
    await log(`Ensuring network mycloud_apps exists...`);
    await DockerNetworkService.ensureNetwork('mycloud_apps');

    const containerName = `mycloud_app_${app.id}`;
    
    await log(`Removing existing container if present...`);
    await DockerContainerService.removeContainer(containerName);

    await log(`Creating container...`);
    const envVars = app.envs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    
    const container = await DockerContainerService.createContainer({
      imageName,
      containerName,
      envVars,
      startCmd: app.startCmd ? app.startCmd.split(' ') : undefined,
      networkMode: 'mycloud_apps',
      restartPolicy: app.restartPolicy,
      memoryLimitMB: app.memoryLimit || undefined,
      cpuLimit: app.cpuLimit || undefined,
    });

    await log(`Starting container...`);
    await container.start();
    
    await log(`Checking health...`);
    // Basic health check (just verify it's running)
    const status = await DockerContainerService.getStatus(containerName);
    if (!status?.Running) {
       throw new Error('Container crashed immediately after start');
    }

    await log(`Deployment completed successfully.`);

    const finishedAt = new Date();
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'SUCCESS',
        finishedAt
      }
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'RUNNING' }
    });

  } catch (error: any) {
    console.error('Deployment failed', error);
    const finishedAt = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE Deployment SET logs = CONCAT(IFNULL(logs, ''), ?) WHERE id = ?`, 
      `ERROR: ${error.message}\n`, deploymentId
    );
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'FAILED',
        error: error.message,
        finishedAt
      }
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'ERROR' }
    });
    
    throw error; // Let BullMQ know it failed
  }
}, { connection });

deploymentWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.log(`Deployment job ${job?.id} failed:`, err.message);
});
