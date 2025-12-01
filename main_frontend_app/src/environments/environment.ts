/**
 * Environment configuration for development.
 * Computes apiBaseUrl dynamically when running in a browser to avoid mixed-content or host mismatches.
 * Honors deployment-provided globals for flexibility.
 */
function computeApiBase(): string {
  // Prefer explicit override if a global is provided by hosting environment
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).location) {
      const g: any = globalThis as any;

      // Support multiple global overrides commonly used by hosting
      const explicit =
        g.NG_APP_API_BASE ||
        g.NG_APP_API_BASE_URL ||
        g.NG_APP_BACKEND_URL;

      if (explicit && typeof explicit === 'string') {
        return explicit;
      }

      const { protocol, hostname } = g.location;

      // If not running on localhost, build API URL using current protocol/host and backend port 3001
      // This prevents HTTPS->HTTP mixed-content and mismatched host issues in preview environments.
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `${protocol}//${hostname}:3001`;
      }
    }
  } catch {
    // ignore and fall through to default
  }
  // Default local dev backend
  return 'http://localhost:3001';
}

export const environment = {
  production: false,
  apiBaseUrl: computeApiBase()
};

// Log once at module eval to aid diagnostics during SSR or browser init
try {
  console.info('[Env] Resolved apiBaseUrl:', (globalThis as any)?.ENV_API_BASE || (environment as any).apiBaseUrl);
} catch {
  // ignore
}
