import { docker } from './dockerClient';

export class DockerEngineService {
  static async ping(): Promise<boolean> {
    try {
      await docker.ping();
      return true;
    } catch {
      return false;
    }
  }

  static async getInfo(): Promise<any> {
    return docker.info();
  }
}
