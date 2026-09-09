import { docker } from './dockerClient';
import { PassThrough } from 'stream';

export class DockerLogService {
  static async getLogs(containerName: string, tail: number = 100): Promise<string> {
    try {
      const container = docker.getContainer(containerName);
      const logStream = await container.logs({
        stdout: true,
        stderr: true,
        tail,
        timestamps: true,
      }) as any;

      if (typeof logStream === 'string') {
          return logStream;
      }
      if (Buffer.isBuffer(logStream)) {
          return logStream.toString('utf8');
      }

      return new Promise((resolve, reject) => {
          let logs = '';
          const pt = new PassThrough();
          pt.on('data', chunk => {
              logs += chunk.toString('utf8');
          });
          pt.on('end', () => resolve(logs));
          pt.on('error', reject);
          container.modem.demuxStream(logStream, pt, pt);
      });
    } catch (e: any) {
      return `Failed to get logs: ${e.message}`;
    }
  }
}
