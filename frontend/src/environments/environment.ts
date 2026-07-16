import { resolveApiUrl } from './runtime-config';

export const environment = {
  production: false,
  apiUrl: resolveApiUrl('http://localhost:3001/api')
};
