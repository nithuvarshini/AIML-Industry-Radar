const ALLOWED_API_ORIGINS = ['http://127.0.0.1:8000', 'http://localhost:8000'];

const rawBase =
  (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://127.0.0.1:8000';

export const API_BASE = ALLOWED_API_ORIGINS.includes(rawBase)
  ? rawBase
  : 'http://127.0.0.1:8000';

const REQUEST_TIMEOUT = 12000;

function validatePath(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || /^(\/\/)|(https?:)/i.test(path)) {
    throw new Error(`Invalid API path: ${path}`);
  }
}

async function fetchJson(path, { signal } = {}) {
  validatePath(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The backend may be offline.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchEndpoint(path, { signal } = {}) {
  return fetchJson(path, { signal });
}
