/**
 * Domain API modules — one thin module per backend resource.
 * Components never call fetch() directly; they import from here.
 */

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "./client.js";

/* ── auth ──────────────────────────────────────────────────── */

export const authApi = {
  login: (email, password) => apiPost("/auth/login", { email, password }),
  logout: () => apiPost("/auth/logout", {}),
  me: () => apiGet("/auth/me"),
};

/* ── dashboard ─────────────────────────────────────────────── */

export const dashboardApi = {
  get: () => apiGet("/admin/dashboard"),
};

/* ── blogs ─────────────────────────────────────────────────── */

export const blogsApi = {
  list: (params = {}) => apiGet(`/admin/blogs${toQuery(params)}`),
  get: (id) => apiGet(`/admin/blogs/${id}`),
  create: (payload) => apiPost("/admin/blogs", payload),
  update: (id, payload) => apiPut(`/admin/blogs/${id}`, payload),
  remove: (id) => apiDelete(`/admin/blogs/${id}`),
};

/* ── categories ────────────────────────────────────────────── */

export const categoriesApi = {
  list: (params = {}) => apiGet(`/admin/categories${toQuery(params)}`),
  create: (payload) => apiPost("/admin/categories", payload),
  update: (id, payload) => apiPut(`/admin/categories/${id}`, payload),
  remove: (id) => apiDelete(`/admin/categories/${id}`),
};

/* ── services ──────────────────────────────────────────────── */

export const servicesApi = {
  list: (params = {}) => apiGet(`/admin/services${toQuery(params)}`),
  get: (id) => apiGet(`/admin/services/${id}`),
  create: (payload) => apiPost("/admin/services", payload),
  update: (id, payload) => apiPut(`/admin/services/${id}`, payload),
  remove: (id) => apiDelete(`/admin/services/${id}`),
};

/* ── gallery ───────────────────────────────────────────────── */

export const galleryApi = {
  list: (params = {}) => apiGet(`/admin/gallery${toQuery(params)}`),
  create: (payload) => apiPost("/admin/gallery", payload),
  update: (id, payload) => apiPut(`/admin/gallery/${id}`, payload),
  remove: (id) => apiDelete(`/admin/gallery/${id}`),
};

/* ── downloads ─────────────────────────────────────────────── */

export const downloadsApi = {
  list: (params = {}) => apiGet(`/admin/downloads${toQuery(params)}`),
  get: (id) => apiGet(`/admin/downloads/${id}`),
  create: (payload) => apiPost("/admin/downloads", payload),
  update: (id, payload) => apiPut(`/admin/downloads/${id}`, payload),
  remove: (id) => apiDelete(`/admin/downloads/${id}`),
};

/* ── messages ──────────────────────────────────────────────── */

export const messagesApi = {
  list: (params = {}) => apiGet(`/admin/messages${toQuery(params)}`),
  get: (id) => apiGet(`/admin/messages/${id}`),
  setStatus: (id, status) => apiPatch(`/admin/messages/${id}/status`, { status }),
  remove: (id) => apiDelete(`/admin/messages/${id}`),
};

/* ── pages ─────────────────────────────────────────────────── */

export const pagesApi = {
  list: () => apiGet("/admin/pages"),
  get: (slug) => apiGet(`/admin/pages/${slug}`),
  update: (slug, payload) => apiPut(`/admin/pages/${slug}`, payload),
};

/* ── settings ──────────────────────────────────────────────── */

export const settingsApi = {
  get: () => apiGet("/admin/settings"),
  update: (payload) => apiPut("/admin/settings", payload),
};

/* ── public (no auth) ──────────────────────────────────────── */

export const publicApi = {
  blogs: (params = {}) => apiGet(`/blogs${toQuery(params)}`),
  blog: (slug) => apiGet(`/blogs/${slug}`),
  services: () => apiGet("/services"),
  gallery: (params = {}) => apiGet(`/gallery${toQuery(params)}`),
  downloads: () => apiGet("/downloads"),
  trackDownload: (id) => apiPost(`/downloads/${id}/track`, {}),
  contact: (payload) => apiPost("/contact", payload),
  site: () => apiGet("/site"),
  page: (slug) => apiGet(`/pages/${slug}`),
};

/* ── helper ────────────────────────────────────────────────── */

function toQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}
