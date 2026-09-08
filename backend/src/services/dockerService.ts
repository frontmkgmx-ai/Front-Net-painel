import Docker from 'dockerode';
import { DatabaseService, Application } from '@prisma/client';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export class DockerService {
  static async pullImage(imageName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      docker.pull(imageName, (err: any, stream: any) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err: any, output: any) {
          if (err) return reject(err);
          resolve();
        }
        function onProgress(event: any) {}
      });
    });
  }

  static async createDatabaseContainer(db: DatabaseService): Promise<any> {
    const imageName = this.getDbImage(db.type, db.version);
    await this.pullImage(imageName);

    const env = this.getDbEnvVars(db);
    await this.ensureNetwork('mycloud_apps');

    const containerName = `mycloud_db_${db.id}`;
    
    // Command overrides
    let Cmd: string[] | undefined = undefined;
    if (db.type === 'REDIS') {
      Cmd = ['redis-server', '--requirepass', db.dbPassword];
    }

    const container = await docker.createContainer({
      Image: imageName,
      name: containerName,
      Env: env,
      Cmd,
      HostConfig: {
        NetworkMode: 'mycloud_apps',
        RestartPolicy: { Name: 'unless-stopped' },
        Memory: db.memoryLimit ? db.memoryLimit * 1024 * 1024 : undefined,
      },
    });

    await container.start();
    return container;
  }

  static async deployApplication(app: Application, envVars: Record<string, string>): Promise<any> {
    const imageName = app.imageName || 'alpine';
    await this.pullImage(imageName);
    
    await this.ensureNetwork('mycloud_apps');
    const containerName = `mycloud_app_${app.id}`;
    
    // Remove existing if any
    try {
      const existing = docker.getContainer(containerName);
      await existing.remove({ force: true });
    } catch (e) {}

    const envArray = Object.entries(envVars).map(([k, v]) => `${k}=${v}`);

    const container = await docker.createContainer({
      Image: imageName,
      name: containerName,
      Env: envArray,
      Cmd: app.startCmd ? app.startCmd.split(' ') : undefined,
      HostConfig: {
        NetworkMode: 'mycloud_apps',
        RestartPolicy: { Name: app.restartPolicy || 'unless-stopped' },
        Memory: app.memoryLimit ? app.memoryLimit * 1024 * 1024 : undefined,
      },
    });

    await container.start();
    return container;
  }
  
  static async startContainer(containerName: string) {
    const container = docker.getContainer(containerName);
    await container.start();
  }

  static async stopContainer(containerName: string) {
    const container = docker.getContainer(containerName);
    await container.stop();
  }

  static async removeContainer(containerName: string) {
    try {
      const container = docker.getContainer(containerName);
      await container.remove({ force: true });
    } catch (e) {}
  }

  static async getContainerStatus(containerName: string) {
    try {
      const container = docker.getContainer(containerName);
      const data = await container.inspect();
      return data.State;
    } catch (e) {
      return null;
    }
  }

  static async getContainerStats(containerName: string) {
    try {
      const container = docker.getContainer(containerName);
      const stream = await container.stats({ stream: false });
      return stream;
    } catch (e) {
      return null;
    }
  }

  private static getDbImage(type: string, version: string | null) {
    const v = version || 'latest';
    switch (type) {
      case 'MYSQL': return `mysql:${v}`;
      case 'POSTGRES': return `postgres:${v}`;
      case 'MONGODB': return `mongo:${v}`;
      case 'REDIS': return `redis:${v}-alpine`;
      case 'MARIADB': return `mariadb:${v}`;
      default: throw new Error(`Unsupported DB type: ${type}`);
    }
  }

  private static getDbEnvVars(db: DatabaseService) {
    switch (db.type) {
      case 'MYSQL': return [`MYSQL_ROOT_PASSWORD=${db.dbPassword}`, `MYSQL_DATABASE=${db.dbName}`, `MYSQL_USER=${db.dbUser}`, `MYSQL_PASSWORD=${db.dbPassword}`];
      case 'POSTGRES': return [`POSTGRES_PASSWORD=${db.dbPassword}`, `POSTGRES_DB=${db.dbName}`, `POSTGRES_USER=${db.dbUser}`];
      case 'MONGODB': return [`MONGO_INITDB_ROOT_USERNAME=${db.dbUser}`, `MONGO_INITDB_ROOT_PASSWORD=${db.dbPassword}`, `MONGO_INITDB_DATABASE=${db.dbName}`];
      case 'REDIS': return []; // Passed via Cmd
      case 'MARIADB': return [`MARIADB_ROOT_PASSWORD=${db.dbPassword}`, `MARIADB_DATABASE=${db.dbName}`, `MARIADB_USER=${db.dbUser}`, `MARIADB_PASSWORD=${db.dbPassword}`];
      default: return [];
    }
  }
  
  static async ensureNetwork(networkName: string) {
    try {
      const net = docker.getNetwork(networkName);
      await net.inspect();
    } catch (e) {
      await docker.createNetwork({ Name: networkName });
    }
  }
}
