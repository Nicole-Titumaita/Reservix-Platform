# Backend Testing

## Stack

- Jest
- Supertest

## Estructura

```text
backend/tests/
├─ unit/
├─ integration/
├─ security/
├─ fixtures/
├─ helpers/
└─ setup/
```

## Variables de prueba

Usar `backend/.env.test` para apuntar a una base separada:

```text
NODE_ENV=test
DB_NAME=sistema_reservas_academico_test
```

## Scripts

```bash
npm test
npm run test:watch
npm run test:coverage
npm run test:ci
npm run test:changed
npm run test:unit
npm run test:integration
npm run test:security
```

## Cobertura actual

- Backend total real observado: 45.39%
- `validators`: 82%
- `auth.service`: 52.38%
- `reservas.service`: 65.18%
- `usuarios.service`: 56%
- `routes`: 100%
- Pruebas ejecutadas: 49
- Suites ejecutadas: 10

## Comparativa por fase

- Fase 2: 38.4% statements, 31.02% branches, 29.33% functions, 38.54% lines
- Fase 3: 45.39% statements, 31.02% branches, 29.33% functions, 45.54% lines

## Módulos con mayor avance

- `reservas.service`
- `usuarios.service`
- `validators`
- `utils/security`
- `utils/pagination`

## Suites de seguridad destacadas

- `tests/security/sql-injection.test.js`
- `tests/security/smtp-security.test.js`
- `tests/security/brute-force.test.js`

## Notas

- Las pruebas usan mocks para SMTP y servicios externos.
- El backend de producción no cambia.
