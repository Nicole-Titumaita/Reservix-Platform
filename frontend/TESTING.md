# Frontend Testing

## Stack

- Jasmine
- Karma
- Angular TestBed

## Estructura

```text
frontend/src/app/
├─ core/
│  ├─ services/
│  └─ guards/
└─ features/
   └─ auth/
      ├─ login/
      ├─ admin-login/
      ├─ register/
      ├─ forgot-password/
      └─ reset-password/
```

## Scripts

```bash
npm test
npm run test:coverage
npm run test:ci
```

## Cobertura actual

- Frontend total real observado: 51.21%
- Branches: 29.18%
- Functions: 38.46%
- Lines: 51.16%
- Pruebas ejecutadas: 20
- Suites ejecutadas: 20

## Comparativa por fase

- Fase 2: 50.14% statements, 29.18% branches, 40.24% functions, 50.74% lines
- Fase 3: 51.21% statements, 29.18% branches, 38.46% functions, 51.16% lines

## Notas

- Los servicios externos se prueban con mocks.
- `ng test` corre en ChromeHeadless.
