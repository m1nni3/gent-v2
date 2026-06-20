import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { showToast } from './toast.js';

describe('showToast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a toast-host container', () => {
    showToast('Hello');
    const host = document.querySelector('.toast-host');
    expect(host).not.toBeNull();
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-live')).toBe('polite');
  });

  it('creates a toast element with the message', () => {
    showToast('Test message');
    const toast = document.querySelector('.toast');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe('Test message');
  });

  it('applies default variant class', () => {
    showToast('Hello');
    const toast = document.querySelector('.toast');
    expect(toast.classList.contains('toast-default')).toBe(true);
  });

  it('applies specified variant class', () => {
    showToast('Success!', { variant: 'success' });
    const toast = document.querySelector('.toast');
    expect(toast.classList.contains('toast-success')).toBe(true);
  });

  it('applies error variant class', () => {
    showToast('Error!', { variant: 'error' });
    const toast = document.querySelector('.toast');
    expect(toast.classList.contains('toast-error')).toBe(true);
  });

  it('adds show class after creation', () => {
    showToast('Hello');
    const toast = document.querySelector('.toast');
    expect(toast.classList.contains('show')).toBe(true);
  });

  it('removes show class after duration', () => {
    showToast('Hello', { duration: 1000 });
    const toast = document.querySelector('.toast');
    expect(toast.classList.contains('show')).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(toast.classList.contains('show')).toBe(false);
  });

  it('uses default duration of 2600ms', () => {
    showToast('Hello');
    const toast = document.querySelector('.toast');
    vi.advanceTimersByTime(2500);
    expect(toast.classList.contains('show')).toBe(true);
    vi.advanceTimersByTime(200);
    expect(toast.classList.contains('show')).toBe(false);
  });

  it('dismisses on click', () => {
    showToast('Clickable');
    const toast = document.querySelector('.toast');
    toast.click();
    expect(toast.classList.contains('show')).toBe(false);
  });

  it('returns the toast element', () => {
    const el = showToast('Return test');
    expect(el.tagName).toBe('DIV');
    expect(el.textContent).toBe('Return test');
  });

  it('reuses existing host container', () => {
    showToast('First');
    showToast('Second');
    const hosts = document.querySelectorAll('.toast-host');
    expect(hosts).toHaveLength(1);
    const toasts = document.querySelectorAll('.toast');
    expect(toasts).toHaveLength(2);
  });
});
