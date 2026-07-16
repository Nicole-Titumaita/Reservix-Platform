function buildApiMessage(message, data = null, success = true) {
  return {
    success,
    message,
    data
  };
}

function toInt(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

module.exports = {
  buildApiMessage,
  toInt
};
