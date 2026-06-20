// Shared utilities used across multiple v4 modules.
// Centralises escapeHtml, color maps, avatar helpers, theme toggle,
// and the sign-out flow so each page module doesn't duplicate them.

import { showToast } from './toast.js';
import { showModal } from './modal.js';

// ── HTML escaping ────────────────────────────────────────────────────────

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Escape a string for safe insertion into HTML text or attribute values.
 * @param {unknown} s
 * @returns {string}
 */
export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
}

/** Alias kept for call-sites that want a semantically distinct name. */
export const escapeAttr = escapeHtml;

// ── Color palette map ────────────────────────────────────────────────────

/** CSS custom-property lookup keyed by short color name. */
export const COLOR_VAR = {
  primary: 'var(--primary)',
  azure: 'var(--azure)',
  blue: 'var(--blue)',
  purple: 'var(--purple)',
  yellow: 'var(--yellow)',
  red: 'var(--red)',
  green: 'var(--green)',
  cyan: 'var(--cyan)',
  orange: 'var(--orange)',
  pink: 'var(--pink)'
};

/** Ordered palette used for auto-assigned avatar backgrounds. */
export const AVATAR_COLORS = [
  'var(--primary)',
  'var(--blue)',
  'var(--purple)',
  'var(--yellow)',
  'var(--green)',
  'var(--cyan)',
  'var(--pink)',
  'var(--orange)'
];

// ── Avatar helpers ───────────────────────────────────────────────────────

/**
 * Deterministic background color from a name string.
 * @param {string} name
 * @returns {string} CSS custom-property value
 */
export function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/**
 * Up to two uppercase initials from a display name.
 * @param {string} name
 * @returns {string}
 */
export function initials(name) {
  if (!name) {
    return '?';
  }
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts
    .map(p => p[0])
    .join('')
    .toUpperCase();
}

// ── Theme toggle ─────────────────────────────────────────────────────────

/**
 * Toggle between light and dark theme. Persists the choice in
 * localStorage and updates the topbar toggle button's aria-pressed.
 */
export function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

/**
 * Apply the given theme name ('light', 'dark', or 'system').
 * @param {string} choice
 */
export function applyTheme(choice) {
  if (choice === 'system') {
    try {
      localStorage.removeItem('theme');
    } catch (_e) {
      /* ignore */
    }
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } else {
    try {
      localStorage.setItem('theme', choice);
    } catch (_e) {
      /* private mode */
    }
    document.documentElement.setAttribute('data-theme', choice);
  }
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.setAttribute(
      'aria-pressed',
      document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false'
    );
  }
}

// ── Sign-out flow ────────────────────────────────────────────────────────

/**
 * Open the "Sign out?" confirmation modal. On confirm, shows a toast
 * and redirects to login.html after a short delay.
 */
export function signOut() {
  showModal({
    title: 'Sign out?',
    size: 'sm',
    body: '<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0">You\'ll need to sign back in to access your dashboard. Any unsaved changes will be lost.</p>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      {
        label: 'Sign out',
        variant: 'primary',
        action: () => {
          showToast('Signed out', { variant: 'success' });
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 600);
        }
      }
    ]
  });
}
