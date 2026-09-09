import { docker } from './dockerClient';

export interface CreateContainerConfig {
  imageName: string;
  containerName: string;
  envVars?: Record<string, string>;
  startCmd?: string[];
  networkMode?: string;
  restartPolicy?: string;
  memoryLimitMB?: number;
  cpuLimit?: number;
  volumes?: string[];
  ports?: string[];
}

export class DockerContainerService {
  static async createContainer(config: CreateContainerConfig): Promise<any> {
    const envArray = config.envVars ? Object.entries(config.envVars).map(([k, v]) => `${k}=${v}`) : undefined;
    
    const container = await docker.createContainer({
      Image: config.imageName,
      name: config.containerName,
      Env: envArray,
      Cmd: config.startCmd,
      HostConfig: {
        NetworkMode: config.networkMode || 'bridge',
        RestartPolicy: { Name: config.restartPolicy || 'unless-stopped' },
        Memory: config.memoryLimitMB ? config.memoryLimitMB * 1024 * 1024 : undefined,
        NanoCpus: config.cpuLimit ? config.cpuLimit * 1000000000 : undefined,
        Binds: config.volumes,
        PortBindings: this.buildPortBindings(config.ports),
      },
      ExposedPorts: this.buildExposedPorts(config.ports),
    });
    
    return container;
  }

  static async startContainer(containerName: string): Promise<void> {
    const container = docker.getContainer(containerName);
    await container.start();
  }

  static async stopContainer(containerName: string): Promise<void> {
    const container = docker.getContainer(containerName);
    await container.stop();
  }

  static async restartContainer(containerName: string): Promise<void> {
    const container = docker.getContainer(containerName);
    await container.restart();
  }

  static async removeContainer(containerName: string): Promise<void> {
    try {
      const container = docker.getContainer(containerName);
      await container.remove({ force: true });
    } catch (e) {}
  }

  static async getStatus(containerName: string): Promise<any> {
    try {
      const container = docker.getContainer(containerName);
      const data = await container.inspect();
      return data.State;
    } catch (e) {
      return null;
    }
  }

  private static buildPortBindings(ports?: string[]): any {
    if (!ports || ports.length === 0) return undefined;
    const portBindings: any = {};
    ports.forEach(p => {
      const parts = p.split(':');
      if (parts.length === 2) {
        portBindings[`${parts[1]}/tcp`] = [{ HostPort: parts[0] }];
      }
    });
    return portBindings;
  }

  private static buildExposedPorts(ports?: string[]): any {
    if (!ports || ports.length === 0) return undefined;
    const exposed: any = {};
    ports.forEach(p => {
      const parts = p.split(':');
      if (parts.length === 2) {
        exposed[`${parts[1]}/tcp`] = {};
      }
    });
    return exposed;
  }
}
