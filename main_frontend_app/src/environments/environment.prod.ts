/**
 * Environment configuration for production.
 * Computes apiBaseUrl dynamically when running in a browser to avoid mixed-content or host mismatches.
 */
function computeApiBase(): string {
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).location) {
      const g: any = globalThis as any;

      // Support multiple overrides for robustness in various deployment setups
      const explicit =
        g.NG_APP_API_BASE ||
        g.NG_APP_API_BASE_URL ||
        g.NG_APP_BACKEND_URL;

      if (explicit && typeof explicit === 'string') {
        return explicit;
      }

      const { protocol, hostname } = g.location;
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `${protocol}//${hostname}:3001`;
      }
    }
  } catch {
    // ignore and fall back
  }
  return 'http://localhost:3001';
}

export const environment = {
  production: true,
  apiBaseUrl: computeApiBase()
};
