import { describe, expect, it } from 'vitest';
import { greet } from './index.js';

describe('greet', () => {
	it('should return a greeting with the given name', () => {
		expect(greet('World')).toBe('Hello, World!');
	});

	it('should handle empty string', () => {
		expect(greet('')).toBe('Hello, !');
	});
});
