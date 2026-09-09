import { 
  DockerEngineService, DockerImageService, DockerContainerService, 
  DockerLogService, DockerStatsService 
} from '../src/services/docker';

async function runTest() {
  console.log('--- DOCKER ORCHESTRATOR TEST ---');
  
  const isUp = await DockerEngineService.ping();
  console.log(`1. Engine Ping: ${isUp}`);
  
  const imageName = 'alpine:latest';
  console.log(`2. Pulling image ${imageName}...`);
  await DockerImageService.pullImage(imageName);
  console.log('   Image pulled.');

  const containerName = 'test_orchestrator_alpine';
  console.log(`3. Creating container ${containerName}...`);
  await DockerContainerService.removeContainer(containerName).catch(() => {});
  
  const container = await DockerContainerService.createContainer({
    imageName,
    containerName,
    startCmd: ['sh', '-c', 'echo "Hello World" && sleep 30'],
  });
  console.log('   Container created.');

  console.log(`4. Starting container...`);
  await container.start();
  
  const status = await DockerContainerService.getStatus(containerName);
  console.log(`   Health/Status: ${status?.Running ? 'Running' : 'Stopped'}`);

  console.log(`5. Collecting logs...`);
  const logs = await DockerLogService.getLogs(containerName);
  console.log(`   Logs: ${logs.trim()}`);

  console.log(`6. Collecting stats...`);
  const stats = await DockerStatsService.getStats(containerName);
  console.log(`   Stats PID: ${stats?.pids_stats?.current}`);

  console.log(`7. Restarting container...`);
  await DockerContainerService.restartContainer(containerName);
  const statusAfterRestart = await DockerContainerService.getStatus(containerName);
  console.log(`   Status after restart: ${statusAfterRestart?.Running ? 'Running' : 'Stopped'}`);

  console.log(`8. Removing container...`);
  await DockerContainerService.removeContainer(containerName);
  
  console.log(`9. Cleaning up image...`);
  // await DockerImageService.removeImage(imageName); // Don't actually remove alpine just in case it's used elsewhere
  
  console.log('--- TEST COMPLETED SUCCESSFULLY ---');
}

runTest().catch(console.error);
