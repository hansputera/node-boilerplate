import { execSync } from 'node:child_process';

// Fail if lint auto-fixed tracked files in src/ that weren't re-staged
try {
	execSync('git diff --quiet -- src/', { stdio: 'pipe' });
} catch {
	process.stderr.write('Unstaged changes in src/ after linting — stage the lint fixes and retry.\n');
	process.exit(1);
}
