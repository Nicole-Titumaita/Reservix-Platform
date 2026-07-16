const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const env = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const rolesRoutes = require('./routes/roles.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const espaciosRoutes = require('./routes/espacios.routes');
const recursosRoutes = require('./routes/recursos.routes');
const horariosRoutes = require('./routes/horarios.routes');
const estadosRoutes = require('./routes/estados.routes');
const reservasRoutes = require('./routes/reservas.routes');
const historialRoutes = require('./routes/historial.routes');

const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const { apiBurstLimiter } = require('./middlewares/rate-limit.middleware');

const app = express();

function matchesAllowedOrigin(origin, allowedOrigins) {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (origin === 'http://localhost:4201' || origin === 'http://localhost:3000' || origin === 'http://localhost:3001') {
    return true;
  }

  if (origin === 'https://reservix.netlify.app') {
    return true;
  }

  if (origin.endsWith('.netlify.app')) {
    return true;
  }

  if (origin.endsWith('.ngrok-free.app')) {
    return true;
  }

  return false;
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.'
  }
});

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = env.corsOrigins;
    const originAllowed = !origin || matchesAllowedOrigin(origin, allowedOrigins);

    if (originAllowed) {
      return callback(null, true);
    }

    const err = new Error(`Origen no permitido por CORS: ${origin}`);
    err.status = 403;
    console.warn(err.message);
    return callback(err);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && matchesAllowedOrigin(origin, env.corsOrigins)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use('/api', apiLimiter);
app.use('/api', apiBurstLimiter);
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/espacios', espaciosRoutes);
app.use('/api/recursos', recursosRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/estados', estadosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/historial', historialRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
