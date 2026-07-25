import { execSync } from 'node:child_process';

try {
	execSync('git diff --quiet -- src/', { stdio: 'pipe', timeout: 30_000 });
} catch {
	process.stderr.write(
		'Unstaged changes in src/ after linting — stage the lint fixes and retry.\n',
	);
	process.exit(1);
}
