// ============================================================
// Auth utilities — fully using Web Crypto API
// PBKDF2-SHA256 for password/key hashing (Cloudflare Workers compatible)
// ============================================================

// ---------------------------------------------------------------------------
// JWT (manual implementation using Web Crypto — HMAC SHA-256)
// ---------------------------------------------------------------------------

function base64UrlEncode(data) {
  const str = typeof data === 'string' ? data : new TextDecoder().decode(data);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

async function getHmacKey(secret) {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + 7 * 24 * 60 * 60 }; // 7 days

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getHmacKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput));
  const sigB64 = base64UrlEncode(new Uint8Array(signature).reduce((s, b) => s + String.fromCharCode(b), ''));

  return `${signingInput}.${sigB64}`;
}

export async function verifyToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const [headerB64, payloadB64, sigB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getHmacKey(secret);
  const encoder = new TextEncoder();

  // Decode the signature
  const sigDecoded = base64UrlDecode(sigB64);
  const sigBytes = new Uint8Array(sigDecoded.length);
  for (let i = 0; i < sigDecoded.length; i++) {
    sigBytes[i] = sigDecoded.charCodeAt(i);
  }

  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(signingInput));
  if (!valid) throw new Error('Invalid token signature');

  const payload = JSON.parse(base64UrlDecode(payloadB64));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error('Token expired');

  return payload;
}

// ---------------------------------------------------------------------------
// Password hashing (Web Crypto API — PBKDF2-SHA256)
// ---------------------------------------------------------------------------

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', data, 'PBKDF2', false, ['deriveBits']
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hashArray = new Uint8Array(hashBuffer);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2,'0')).join('');
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2,'0')).join('');
  return saltHex + ':' + hashHex;
}

async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const keyMaterial = await crypto.subtle.importKey(
    'raw', data, 'PBKDF2', false, ['deriveBits']
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hashArray = new Uint8Array(hashBuffer);
  const newHashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2,'0')).join('');
  return newHashHex === hashHex;
}

export { hashPassword, verifyPassword };

export async function comparePassword(password, hash) {
  return verifyPassword(password, hash);
}

// ---------------------------------------------------------------------------
// API Key generation — using Web Crypto API
// ---------------------------------------------------------------------------

function randomHex(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateApiKeys() {
  const publicKey = 'pk_live_' + randomHex(24);
  const secretKey = 'sk_live_' + randomHex(32);
  return { publicKey, secretKey };
}

export async function hashApiKey(key) {
  return hashPassword(key);
}

export async function compareApiKey(key, hash) {
  return verifyPassword(key, hash);
}

// ---------------------------------------------------------------------------
// Transaction ID generation
// ---------------------------------------------------------------------------

export function generateTransactionId() {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = randomHex(4).toUpperCase();
  return `TXN_${date}_${random}`;
}

// ---------------------------------------------------------------------------
// Transaction hash — using Web Crypto HMAC SHA-256
// ---------------------------------------------------------------------------

export async function generateTransactionHash(merchantId, amount, orderId, transactionId, timestamp, secret) {
  const data = `${merchantId}|${amount}|${orderId}|${transactionId}|${timestamp}`;
  const key = await getHmacKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// UPI Intent URLs (identical business logic)
// ---------------------------------------------------------------------------

export function generateUPIIntentURLs(vpa, payeeName, amountPaise, orderId, txnRef) {
  const amountStr = (amountPaise / 100).toFixed(2);
  const encodePa = (v) => encodeURIComponent(v).replace(/%40/g, '@');
  const cleanName = payeeName.replace(/[^a-zA-Z0-9]/g, '');
  const cleanOrderId = orderId.replace(/[^a-zA-Z0-9\-]/g, '').slice(0, 31);
  const tn = `Payment for Order ${cleanOrderId}`.slice(0, 50);
  const cleanTxnRef = txnRef.replace(/[^a-zA-Z0-9]/g, '');

  const params = [
    `pa=${encodePa(vpa)}`,
    `pn=${cleanName}`,
    `am=${amountStr}`,
    `cu=INR`,
    `tn=${encodeURIComponent(tn)}`,
    `tr=${cleanTxnRef}`,
    `mc=0000`,
    `mode=00`,
    `purpose=00`,
  ].join('&');

  const generic = `upi://pay?${params}`;
  const intentBase = `intent://pay?${params}#Intent;scheme=upi`;

  return {
    generic,
    gpay: `${intentBase};package=com.google.android.apps.nbu.paisa.user;end`,
    phonepe: `${intentBase};package=com.phonepe.app;end`,
    paytm: `${intentBase};package=net.one97.paytm;end`,
    bhim: `${intentBase};package=in.org.npci.upiapp;end`,
  };
}
