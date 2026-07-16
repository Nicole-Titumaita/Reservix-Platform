const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');
const { verifySmtpConnection } = require('./services/two-factor.service');

async function bootstrap() {
  try {
    await testConnection();
    await verifySmtpConnection();
    app.listen(env.port, () => {
      console.log(`Servidor ejecutandose en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el backend:');
    console.error({
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    process.exit(1);
  }
}

bootstrap();
