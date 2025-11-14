/**
 * @typedef {Object} Account
 * @property {number|string|null} id
 * @property {string} name
 * @property {string} email
 * @property {string} userId
 * @property {string} role
 * @property {string} phone
 * @property {string} status
 * @property {string|null} lastLogin - ISO string or null
 * @property {string|null} avatar
 * @property {string|null} password
 */

/**
 * Create a new empty account object with default values used across the app.
 * @returns {Account}
 */
export function createEmptyAccount() {
  return {
    id: null,
    name: '',
    email: '',
    userId: '',
    role: '',
    phone: '',
    status: 'active',
    lastLogin: null,
    avatar: null,
    password: ''
  }
}

/**
 * Normalize backend user object into frontend Account shape.
 * Accepts either snake_case from backend or already-normalized objects.
 * @param {Object} u
 * @returns {Account}
 */
export function normalizeAccount(u = {}) {
  return {
    id: u.id ?? u.pk ?? null,
    name: u.name ?? u.full_name ?? u.displayName ?? '',
    email: u.email ?? '',
    userId: u.userId ?? u.username ?? u.code ?? '',
    role: u.role ?? u.user_role ?? '',
    phone: u.phone ?? u.phone_number ?? '',
    status: u.status ?? 'active',
    lastLogin: u.last_login ?? u.lastLogin ?? null,
    avatar: u.avatar ?? null,
    password: u.password ?? ''
  }
}
