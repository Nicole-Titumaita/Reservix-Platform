describe('SMTP and delivery security', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('creates a transporter and sends OTP email when SMTP is configured', async () => {
    const sendMail = jest.fn(async () => true);
    const verify = jest.fn(async () => true);
    const createTransport = jest.fn(() => ({ sendMail, verify }));

    jest.doMock('nodemailer', () => ({ createTransport }));
    jest.doMock('../../src/config/env', () => ({
      nodeEnv: 'production',
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: 'demo@gmail.com',
        pass: 'app-pass',
        from: 'Sistema Academico <demo@gmail.com>'
      }
    }));
    jest.doMock('../../src/models', () => ({
      twoFactorCodes: {
        invalidateActive: jest.fn(async () => true),
        create: jest.fn(async () => true),
        findLatestActive: jest.fn(),
        markUsed: jest.fn()
      },
      usuarios: {
        findById: jest.fn(async () => ({
          id: 1,
          email: 'alumno@demo.com',
          nombre: 'Alumno',
          apellido: 'Demo',
          rol_nombre: 'ESTUDIANTE'
        }))
      }
    }));

    const service = require('../../src/services/two-factor.service');
    const result = await service.createAndSend({
      id: 1,
      email: 'alumno@demo.com',
      nombre: 'Alumno',
      apellido: 'Demo',
      rol_nombre: 'ESTUDIANTE'
    });

    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(result.delivery_channel).toBe('email');
    expect(result.requires_2fa).toBe(true);
  });

  test('falls back to console in development when SMTP is missing', async () => {
    const createTransport = jest.fn(() => null);

    jest.doMock('nodemailer', () => ({ createTransport }));
    jest.doMock('../../src/config/env', () => ({
      nodeEnv: 'development',
      smtp: {
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        from: 'no-reply@demo.local'
      }
    }));
    jest.doMock('../../src/models', () => ({
      twoFactorCodes: {
        invalidateActive: jest.fn(async () => true),
        create: jest.fn(async () => true),
        findLatestActive: jest.fn(),
        markUsed: jest.fn()
      },
      usuarios: {
        findById: jest.fn(async () => ({
          id: 1,
          email: 'alumno@demo.local',
          nombre: 'Alumno',
          apellido: 'Demo',
          rol_nombre: 'ESTUDIANTE'
        }))
      }
    }));

    const service = require('../../src/services/two-factor.service');
    const result = await service.createAndSend({
      id: 1,
      email: 'alumno@demo.local',
      nombre: 'Alumno',
      apellido: 'Demo',
      rol_nombre: 'ESTUDIANTE'
    });

    expect(createTransport).not.toHaveBeenCalled();
    expect(result.delivery_channel).toBe('console');
  });

  test('rejects SMTP startup when configured in production but transporter is unavailable', async () => {
    const createTransport = jest.fn(() => null);

    jest.doMock('nodemailer', () => ({ createTransport }));
    jest.doMock('../../src/config/env', () => ({
      nodeEnv: 'production',
      smtp: {
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        from: 'no-reply@demo.local'
      }
    }));

    const service = require('../../src/services/two-factor.service');

    await expect(service.verifySmtpConnection()).rejects.toThrow(/SMTP no configurado/i);
  });
});
