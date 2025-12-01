/**
 * Environment configuration for development.
 * Computes apiBaseUrl dynamically when running in a browser to avoid mixed-content or host mismatches.
 */
function computeApiBase(): string {
  // Prefer explicit override if a global is provided by hosting environment
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).location) {
      const g: any = globalThis as any;
      if (g.NG_APP_BACKEND_URL && typeof g.NG_APP_BACKEND_URL === 'string') {
        return g.NG_APP_BACKEND_URL;
      }
      const { protocol, hostname } = g.location;
      // If not running on localhost, build API URL using current protocol/host and backend port 3001
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `${protocol}//${hostname}:3001`;
      }
    }
  } catch {
    // ignore and fall through to default
  }
  return 'http://localhost:3001';
}

export const environment = {
  production: false,
  apiBaseUrl: computeApiBase()
};
