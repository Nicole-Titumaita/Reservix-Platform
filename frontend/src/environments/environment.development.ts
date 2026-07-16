import { resolveApiUrl } from './runtime-config';

export const environment = {
  production: false,
  apiUrl: resolveApiUrl('https://68c2-2800-440-920a-3f00-ead1-d32b-fa7a-e17a.ngrok-free.app/api')
};
