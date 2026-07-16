process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME || 'sistema_reservas_academico_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_12345678901234567890';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4201';
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:4201';
