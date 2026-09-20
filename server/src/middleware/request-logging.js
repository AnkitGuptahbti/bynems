const SECRET_KEY = /(password|token|secret|signature|credential|authorization|cookie)/i;
const PHONE_KEY = /(phone|contact|mobile)/i;
const EMAIL_KEY = /email/i;
const ADDRESS_KEY = /^(address|apartment|landmark)$/i;
const PII_KEY = /^(fullName|pincode|postalCode)$/i;
const OMIT_KEY = /^(raw)$/i;
const MAX_DEPTH = 6;
const MAX_ARRAY_ITEMS = 25;
const MAX_OBJECT_KEYS = 60;
const MAX_STRING_LENGTH = 500;

function maskEmail(value) {
  const [local, domain] = String(value).split('@');
  if (!domain) return '[REDACTED PII]';
  return `${local.slice(0, 1)}***@${domain}`;
}

function maskPhone(value) {
  const text = String(value);
  return `${'*'.repeat(Math.max(0, text.length - 4))}${text.slice(-4)}`;
}

function sanitizeForLog(value, key = '', depth = 0) {
  if (SECRET_KEY.test(key)) return '[REDACTED]';
  if (OMIT_KEY.test(key)) return '[OMITTED]';
  if (EMAIL_KEY.test(key)) return maskEmail(value);
  if (PHONE_KEY.test(key)) return maskPhone(value);
  if (ADDRESS_KEY.test(key)) return '[REDACTED PII]';
  if (PII_KEY.test(key)) return '[REDACTED PII]';
  if (value === null || value === undefined) return value;
  if (Buffer.isBuffer(value)) return `[Buffer ${value.length} bytes]`;
  if (depth >= MAX_DEPTH) return '[MAX DEPTH]';
  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…[truncated]`
      : value;
  }
  if (typeof value !== 'object') return value;
  if (typeof value.toJSON === 'function') {
    try {
      return sanitizeForLog(value.toJSON(), key, depth + 1);
    } catch {
      return '[UNSERIALIZABLE]';
    }
  }
  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeForLog(item, key, depth + 1));
    if (value.length > MAX_ARRAY_ITEMS) items.push(`[${value.length - MAX_ARRAY_ITEMS} more items]`);
    return items;
  }

  const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS);
  const sanitized = Object.fromEntries(
    entries.map(([childKey, childValue]) => [childKey, sanitizeForLog(childValue, childKey, depth + 1)])
  );
  if (Object.keys(value).length > MAX_OBJECT_KEYS) sanitized._truncated = true;
  return sanitized;
}

function requestPayloadLogger(req, res, next) {
  const requestContext = {
    params: sanitizeForLog(req.params),
    query: sanitizeForLog(req.query),
  };
  if (req.body !== undefined && !Buffer.isBuffer(req.body)) {
    requestContext.body = sanitizeForLog(req.body);
  }
  req.log.debug(requestContext, 'Request payload received');

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    req.log.debug({
      statusCode: res.statusCode,
      body: sanitizeForLog(body),
    }, 'Response payload sent');
    return originalJson(body);
  };
  next();
}

module.exports = { requestPayloadLogger, sanitizeForLog };
