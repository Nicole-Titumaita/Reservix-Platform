const { normalizeText, hasDangerousContent, assertSafeText } = require('../../src/utils/security');
const { validateCedulaEcuador } = require('../../src/utils/cedula-ecuador');
const { parsePagination, buildPaginatedResult } = require('../../src/utils/pagination');

describe('Security utilities', () => {
  test('normalizes and strips dangerous tags', () => {
    expect(normalizeText('  <script>alert(1)</script>Hola$  ', 20)).toBe('alert(1)Hola');
    expect(hasDangerousContent('<script>alert(1)</script>')).toBe(true);
    expect(hasDangerousContent('texto seguro')).toBe(false);
  });

  test('detects dangerous content and throws on assertSafeText', () => {
    expect(() => assertSafeText('hola<script>', 'campo')).toThrow(/no permitidos/i);
  });

  test('validates Ecuadorian cedula', () => {
    const result = validateCedulaEcuador('1710034065');
    expect(result.valid).toBe(true);
    expect(result.provincia).toBeTruthy();
    expect(validateCedulaEcuador('0000000000').valid).toBe(false);
  });

  test('parses pagination and builds response', () => {
    const pagination = parsePagination({ page: '2', limit: '10' });
    expect(pagination).toEqual({ page: 2, limit: 10, offset: 10 });
    expect(buildPaginatedResult(['a'], 25, pagination)).toEqual({
      items: ['a'],
      pagination: { page: 2, limit: 10, total: 25, total_pages: 3 }
    });
    expect(parsePagination({ page: 'abc', limit: '10' })).toBeNull();
    expect(parsePagination({ page: '1', limit: '999' })).toEqual({ page: 1, limit: 100, offset: 0 });
  });
});
