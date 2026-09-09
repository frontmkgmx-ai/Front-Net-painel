import { docker } from './dockerClient';

export class DockerNetworkService {
  static async ensureNetwork(networkName: string): Promise<void> {
    try {
      const net = docker.getNetwork(networkName);
      await net.inspect();
    } catch (e) {
      await docker.createNetwork({ Name: networkName });
    }
  }

  static async listNetworks(): Promise<any[]> {
    return docker.listNetworks();
  }
}
