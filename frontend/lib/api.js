const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || 'Terjadi kesalahan.';
    const detail = data.errors ? ' ' + data.errors.join(' ') : '';
    throw new Error(msg + detail);
  }
  return data;
}

export const api = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    ).toString();
    return request(`/destinasi${qs ? `?${qs}` : ''}`);
  },
  getOne: (id) => request(`/destinasi/${id}`),
  create: (body) => request('/destinasi', { method: 'POST', body: JSON.stringify(body) }),
  replace: (id, body) => request(`/destinasi/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  update: (id, body) => request(`/destinasi/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id) => request(`/destinasi/${id}`, { method: 'DELETE' }),
  ask: (id, question, history = []) =>
    request(`/destinasi/${id}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question, history }),
    }),
  stats: () => request('/stats'),
  meta: () => request('/meta'),
};

export const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%232dd4bf'/%3E%3Cstop offset='1' stop-color='%230ea5e9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='260' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' font-size='60' text-anchor='middle' dy='.35em'%3E🏝️%3C/text%3E%3C/svg%3E";

export function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  return new Intl.NumberFormat('id-ID').format(n);
}

export function formatRupiah(n) {
  if (n === null || n === undefined || Number.isNaN(n) || n === 0) return 'Gratis';
  return 'Rp ' + formatNumber(n);
}

export function safeImg(url) {
  if (!url) return PLACEHOLDER;
  if (/^data:image\//i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return PLACEHOLDER;
}
