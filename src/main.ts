import { greet } from './index.js';

function main(): void {
	const name = process.argv[2] ?? 'World';
	process.stdout.write(`${greet(name)}\n`);
}

process.on('SIGTERM', () => {
	process.exit(0);
});

process.on('SIGINT', () => {
	process.exit(0);
});

process.on('uncaughtException', (error) => {
	process.stderr.write(`Uncaught exception: ${error.message}\n`);
	process.exit(1);
});

process.on('unhandledRejection', (reason) => {
	process.stderr.write(`Unhandled rejection: ${String(reason)}\n`);
	process.exit(1);
});

main();
