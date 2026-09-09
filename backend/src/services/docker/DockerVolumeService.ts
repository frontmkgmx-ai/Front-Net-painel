import { docker } from './dockerClient';

export class DockerVolumeService {
  static async ensureVolume(volumeName: string): Promise<void> {
    try {
      const vol = docker.getVolume(volumeName);
      await vol.inspect();
    } catch (e) {
      await docker.createVolume({ Name: volumeName });
    }
  }

  static async listVolumes(): Promise<any> {
    return docker.listVolumes();
  }

  static async removeVolume(volumeName: string): Promise<void> {
    try {
      const vol = docker.getVolume(volumeName);
      await vol.remove();
    } catch (e) {}
  }
}
