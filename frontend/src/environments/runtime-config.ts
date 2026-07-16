export interface RuntimeAppConfig {
  apiUrl?: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeAppConfig;
  }
}

export function resolveApiUrl(fallback: string): string {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }

  const runtimeUrl = window.__APP_CONFIG__?.apiUrl?.trim();
  return runtimeUrl || fallback;
}
