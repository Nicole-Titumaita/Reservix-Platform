const {
  validateAuthRegisterPayload,
  validateAuthLoginPayload,
  validateUsuarioPayload,
  validateRolePayload,
  validateEspacioPayload,
  validateRecursoPayload,
  validateReservaPayload,
  validateEstadoPayload
} = require('../../src/validators');

describe('Validators', () => {
  test('accepts demo.local emails and strong passwords', () => {
    const payload = {
      nombre: 'María',
      apellido: 'Gómez',
      cedula: '1710034065',
      email: 'demo@demo.local',
      password: 'Seguro123*',
      confirm_password: 'Seguro123*',
      codigo_institucional: 'EST-2026-000001'
    };

    expect(() => validateAuthRegisterPayload(payload)).not.toThrow();
    expect(payload.email).toBe('demo@demo.local');
  });

  test('rejects weak passwords', () => {
    const payload = {
      nombre: 'María',
      apellido: 'Gómez',
      cedula: '1710034065',
      email: 'demo@demo.local',
      password: 'abc123',
      confirm_password: 'abc123',
      codigo_institucional: 'EST-2026-000001'
    };

    expect(() => validateAuthRegisterPayload(payload)).toThrow(/contrasena/i);
  });

  test('rejects invalid login email', () => {
    expect(() => validateAuthLoginPayload({ email: 'bad-email', password: 'abc12345' })).toThrow(/correo valido/i);
  });

  test('sanitizes user payload and accepts institutional code when present', () => {
    const payload = {
      rol_id: 3,
      nombre: ' Juan ',
      apellido: ' Pérez ',
      cedula: '1710034065',
      email: 'juan@demo.local',
      codigo_institucional: 'est-2026-000001'
    };

    expect(() => validateUsuarioPayload(payload)).not.toThrow();
    expect(payload.nombre).toContain('Juan');
    expect(payload.codigo_institucional).toBe('EST-2026-000001');
  });

  test('rejects mismatched passwords', () => {
    const payload = {
      nombre: 'Maria',
      apellido: 'Gomez',
      cedula: '1710034065',
      email: 'demo@demo.local',
      password: 'Seguro123*',
      confirm_password: 'Seguro1234*',
      codigo_institucional: 'EST-2026-000001'
    };

    expect(() => validateAuthRegisterPayload(payload)).toThrow(/no coinciden/i);
  });

  test('validates role, space, resource, state and reservation payloads', () => {
    expect(() => validateRolePayload({ nombre: 'ADMINISTRADOR', descripcion: 'Rol' })).not.toThrow();
    expect(() => validateEspacioPayload({ codigo: 'A1', nombre: 'Lab', tipo: 'LABORATORIO', estado_id: 1 })).not.toThrow();
    expect(() => validateRecursoPayload({ codigo: 'R1', nombre: 'Proyector', tipo: 'EQUIPO', estado_id: 1 })).not.toThrow();
    expect(() => validateEstadoPayload({ categoria: 'RESERVA', nombre: 'PENDIENTE' })).not.toThrow();
    expect(() => validateReservaPayload({
      usuario_id: 1,
      espacio_id: 2,
      horario_id: 3,
      estado_id: 4,
      fecha_reserva: '2026-01-01',
      fecha_inicio: '2026-01-01T10:00:00Z',
      fecha_fin: '2026-01-01T11:00:00Z',
      motivo: 'Clase'
    })).not.toThrow();
  });
});
