import { docker } from './dockerClient';

export class DockerImageService {
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

  static async listImages(): Promise<any[]> {
    return docker.listImages();
  }

  static async inspectImage(imageName: string): Promise<any> {
    const image = docker.getImage(imageName);
    return image.inspect();
  }

  static async removeImage(imageName: string): Promise<void> {
    const image = docker.getImage(imageName);
    await image.remove({ force: true });
  }
}
