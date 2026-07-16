function normalizeText(value, maxLength = 120) {
  if (value === undefined || value === null) return '';
  return String(value)
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[<>{}[\]`$\\]/g, '')
    .slice(0, maxLength);
}

function hasDangerousContent(value) {
  if (value === undefined || value === null) return false;
  return /<\s*script|javascript:|on\w+\s*=|--|\/\*|\*\/|;|\\x/i.test(String(value));
}

function assertSafeText(value, fieldName) {
  if (hasDangerousContent(value)) {
    const error = new Error(`${fieldName} contiene caracteres no permitidos`);
    error.status = 400;
    throw error;
  }
}

module.exports = {
  normalizeText,
  hasDangerousContent,
  assertSafeText
};
