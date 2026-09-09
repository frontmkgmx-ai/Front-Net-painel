import { docker } from './dockerClient';

export class DockerStatsService {
  static async getStats(containerName: string): Promise<any> {
    try {
      const container = docker.getContainer(containerName);
      const stats = await container.stats({ stream: false });
      return stats;
    } catch (e) {
      return null;
    }
  }
}
