import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { showModal, closeModal, isModalOpen } from './modal.js';

describe('modal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.className = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    closeModal({ skipHook: true });
    vi.useRealTimers();
  });

  describe('showModal', () => {
    it('creates a backdrop and dialog', () => {
      showModal({ title: 'Test' });
      const backdrop = document.querySelector('.modal-backdrop');
      const dialog = document.querySelector('.modal-dialog');
      expect(backdrop).not.toBeNull();
      expect(dialog).not.toBeNull();
    });

    it('sets aria-modal and role on dialog', () => {
      showModal({ title: 'Accessible' });
      const dialog = document.querySelector('.modal-dialog');
      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('sets aria-label from title', () => {
      showModal({ title: 'My Dialog' });
      const dialog = document.querySelector('.modal-dialog');
      expect(dialog.getAttribute('aria-label')).toBe('My Dialog');
    });

    it('renders title text', () => {
      showModal({ title: 'Hello World' });
      const titleEl = document.querySelector('.modal-title');
      expect(titleEl.textContent).toBe('Hello World');
    });

    it('renders body as HTML string', () => {
      showModal({ title: 'T', body: '<p>Content here</p>' });
      const body = document.querySelector('.modal-body');
      expect(body.innerHTML).toContain('<p>Content here</p>');
    });

    it('renders body as DOM element', () => {
      const el = document.createElement('div');
      el.textContent = 'Dynamic content';
      showModal({ title: 'T', body: el });
      const body = document.querySelector('.modal-body');
      expect(body.textContent).toContain('Dynamic content');
    });

    it('applies size class', () => {
      showModal({ title: 'T', size: 'lg' });
      const dialog = document.querySelector('.modal-dialog');
      expect(dialog.classList.contains('modal-lg')).toBe(true);
    });

    it('defaults to md size', () => {
      showModal({ title: 'T' });
      const dialog = document.querySelector('.modal-dialog');
      expect(dialog.classList.contains('modal-md')).toBe(true);
    });

    it('adds modal-open class to body', () => {
      showModal({ title: 'T' });
      expect(document.body.classList.contains('modal-open')).toBe(true);
    });

    it('renders action buttons', () => {
      showModal({
        title: 'T',
        actions: [
          { label: 'Cancel', variant: 'ghost' },
          { label: 'OK', variant: 'primary' }
        ]
      });
      const footer = document.querySelector('.modal-footer');
      expect(footer).not.toBeNull();
      const buttons = footer.querySelectorAll('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].textContent).toBe('Cancel');
      expect(buttons[1].textContent).toBe('OK');
    });

    it('applies variant class to buttons', () => {
      showModal({
        title: 'T',
        actions: [{ label: 'Delete', variant: 'danger' }]
      });
      const btn = document.querySelector('.modal-footer button');
      expect(btn.classList.contains('btn-danger')).toBe(true);
    });

    it('returns dialog, body, and close function', () => {
      const result = showModal({ title: 'T', body: 'Content' });
      expect(result.dialog).toBeInstanceOf(HTMLElement);
      expect(result.body).toBeInstanceOf(HTMLElement);
      expect(typeof result.close).toBe('function');
    });

    it('closes previous modal when opening a new one', () => {
      showModal({ title: 'First' });
      showModal({ title: 'Second' });
      // The old backdrop removal is deferred (transitionend / 280ms timeout),
      // but the new modal should be the active one tracked internally.
      vi.advanceTimersByTime(300);
      const dialogs = document.querySelectorAll('.modal-dialog');
      expect(dialogs).toHaveLength(1);
      expect(document.querySelector('.modal-title').textContent).toBe('Second');
    });
  });

  describe('closeModal', () => {
    it('removes modal-open class from body', () => {
      showModal({ title: 'T' });
      closeModal();
      expect(document.body.classList.contains('modal-open')).toBe(false);
    });

    it('calls onClose hook', () => {
      const onClose = vi.fn();
      showModal({ title: 'T', onClose });
      closeModal();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('skips hook when skipHook is true', () => {
      const onClose = vi.fn();
      showModal({ title: 'T', onClose });
      closeModal({ skipHook: true });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('is safe to call when no modal is open', () => {
      expect(() => closeModal()).not.toThrow();
    });
  });

  describe('isModalOpen', () => {
    it('returns false when no modal is open', () => {
      expect(isModalOpen()).toBe(false);
    });

    it('returns true when a modal is open', () => {
      showModal({ title: 'T' });
      expect(isModalOpen()).toBe(true);
    });

    it('returns false after closing', () => {
      showModal({ title: 'T' });
      closeModal();
      expect(isModalOpen()).toBe(false);
    });
  });

  describe('action button behavior', () => {
    it('calls action callback with context', () => {
      const action = vi.fn();
      showModal({
        title: 'T',
        actions: [{ label: 'Go', variant: 'primary', action }]
      });
      const btn = document.querySelector('.modal-footer button');
      btn.click();
      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith(
        expect.objectContaining({
          dialog: expect.any(HTMLElement),
          body: expect.any(HTMLElement),
          close: expect.any(Function)
        })
      );
    });

    it('closes modal after action by default', () => {
      showModal({
        title: 'T',
        actions: [{ label: 'Go', action: () => {} }]
      });
      const btn = document.querySelector('.modal-footer button');
      btn.click();
      expect(isModalOpen()).toBe(false);
    });

    it('keeps modal open when action returns false', () => {
      showModal({
        title: 'T',
        actions: [{ label: 'Validate', action: () => false }]
      });
      const btn = document.querySelector('.modal-footer button');
      btn.click();
      expect(isModalOpen()).toBe(true);
    });

    it('keeps modal open when closeOnAction is false', () => {
      showModal({
        title: 'T',
        actions: [{ label: 'Stay', closeOnAction: false, action: () => {} }]
      });
      const btn = document.querySelector('.modal-footer button');
      btn.click();
      expect(isModalOpen()).toBe(true);
    });
  });

  describe('close button', () => {
    it('closes modal when close button is clicked', () => {
      showModal({ title: 'T' });
      const closeBtn = document.querySelector('.modal-close');
      closeBtn.click();
      expect(isModalOpen()).toBe(false);
    });
  });

  describe('backdrop click', () => {
    it('closes modal on backdrop click', () => {
      showModal({ title: 'T' });
      const backdrop = document.querySelector('.modal-backdrop');
      backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(isModalOpen()).toBe(false);
    });

    it('does not close on dialog click', () => {
      showModal({ title: 'T' });
      const dialog = document.querySelector('.modal-dialog');
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(isModalOpen()).toBe(true);
    });
  });

  describe('escape key', () => {
    it('closes modal on Escape', () => {
      showModal({ title: 'T' });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(isModalOpen()).toBe(false);
    });
  });
});
