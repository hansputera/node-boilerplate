import { env } from './config/env.js';
import { greet } from './index.js';
import { startHealthServer } from './health.js';

// Load environment variables from SOPS encrypted file
env.load();

function main(): void {
  const port = env.getOptional('PORT', '3000');
  const healthPort = Number(env.getOptional('HEALTH_PORT', '3001'));

  // Start health check server
  startHealthServer(healthPort);

  // Main application logic
  const name = process.argv[2] ?? 'World';
  process.stdout.write(`${greet(name)}\n`);
  process.stdout.write(`Server running on port ${port}\n`);
}

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully...`);

  // Set deadline for forced shutdown
  const deadline = Date.now() + 30_000; // 30 seconds

  // Perform cleanup here (close connections, drain queues, etc.)
  // await cleanup();

  console.log('Shutdown complete');
  process.exit(0);

  // Force exit after deadline
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, deadline - Date.now());
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

main();
