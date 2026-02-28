import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import { BASE_URL } from './helpers.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

describe('API Root', () => {
  it('should return welcome message with version', async () => {
    const response = await fetch(`${BASE_URL}/api`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe(`Welcome to the Peapod API v${version}!`);
  });

  it('should return health check', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.version).toBe(version);
  });
});
