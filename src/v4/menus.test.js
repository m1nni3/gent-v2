import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { openMenu, openPanel, closeMenu, DEFAULT_CARD_MENU } from './menus.js';

describe('menus', () => {
  let trigger;

  beforeEach(() => {
    document.body.innerHTML = '';
    trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
  });

  afterEach(() => {
    closeMenu();
  });

  describe('openMenu', () => {
    it('creates a menu-popover element', () => {
      openMenu(trigger, [{ label: 'Edit' }]);
      const menu = document.querySelector('.menu-popover');
      expect(menu).not.toBeNull();
      expect(menu.getAttribute('role')).toBe('menu');
    });

    it('renders menu items as buttons', () => {
      openMenu(trigger, [{ label: 'Edit' }, { label: 'Delete' }]);
      const items = document.querySelectorAll('.menu-item');
      expect(items).toHaveLength(2);
      expect(items[0].textContent).toBe('Edit');
      expect(items[1].textContent).toBe('Delete');
    });

    it('renders separator for "-" items', () => {
      openMenu(trigger, [{ label: 'A' }, '-', { label: 'B' }]);
      const sep = document.querySelector('.menu-separator');
      expect(sep).not.toBeNull();
    });

    it('sets aria-expanded on trigger', () => {
      openMenu(trigger, [{ label: 'X' }]);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('toggles closed when same trigger is used again', () => {
      openMenu(trigger, [{ label: 'X' }]);
      openMenu(trigger, [{ label: 'X' }]);
      expect(document.querySelector('.menu-popover')).toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('closes previous menu when opening from different trigger', () => {
      const trigger2 = document.createElement('button');
      document.body.appendChild(trigger2);
      openMenu(trigger, [{ label: 'A' }]);
      openMenu(trigger2, [{ label: 'B' }]);
      const menus = document.querySelectorAll('.menu-popover');
      expect(menus).toHaveLength(1);
      expect(menus[0].querySelector('.menu-item').textContent).toBe('B');
    });

    it('calls action when item is clicked', () => {
      const action = vi.fn();
      openMenu(trigger, [{ label: 'Do it', action }]);
      const item = document.querySelector('.menu-item');
      item.click();
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('passes trigger to action callback', () => {
      const action = vi.fn();
      openMenu(trigger, [{ label: 'Do it', action }]);
      const item = document.querySelector('.menu-item');
      item.click();
      expect(action).toHaveBeenCalledWith(trigger);
    });

    it('closes menu after item click', () => {
      openMenu(trigger, [{ label: 'X', action: () => {} }]);
      const item = document.querySelector('.menu-item');
      item.click();
      expect(document.querySelector('.menu-popover')).toBeNull();
    });

    it('sets role=menuitem on items', () => {
      openMenu(trigger, [{ label: 'X' }]);
      const item = document.querySelector('.menu-item');
      expect(item.getAttribute('role')).toBe('menuitem');
    });
  });

  describe('openPanel', () => {
    it('creates a menu-panel element', () => {
      openPanel(trigger, '<p>Hello</p>');
      const panel = document.querySelector('.menu-panel');
      expect(panel).not.toBeNull();
      expect(panel.getAttribute('role')).toBe('dialog');
    });

    it('renders HTML string content', () => {
      openPanel(trigger, '<p>Panel content</p>');
      const panel = document.querySelector('.menu-panel');
      expect(panel.innerHTML).toContain('<p>Panel content</p>');
    });

    it('renders DOM element content', () => {
      const content = document.createElement('div');
      content.textContent = 'Dynamic';
      openPanel(trigger, content);
      const panel = document.querySelector('.menu-panel');
      expect(panel.textContent).toContain('Dynamic');
    });

    it('applies className option', () => {
      openPanel(trigger, 'Hi', { className: 'panel-notifications' });
      const panel = document.querySelector('.menu-panel');
      expect(panel.classList.contains('panel-notifications')).toBe(true);
    });

    it('applies width option', () => {
      openPanel(trigger, 'Hi', { width: 300 });
      const panel = document.querySelector('.menu-panel');
      expect(panel.style.width).toBe('300px');
    });

    it('sets aria-expanded on trigger', () => {
      openPanel(trigger, 'Hi');
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('toggles closed when same trigger is used again', () => {
      openPanel(trigger, 'Hi');
      openPanel(trigger, 'Hi');
      expect(document.querySelector('.menu-panel')).toBeNull();
    });
  });

  describe('closeMenu', () => {
    it('removes the popover', () => {
      openMenu(trigger, [{ label: 'X' }]);
      closeMenu();
      expect(document.querySelector('.menu-popover')).toBeNull();
    });

    it('resets aria-expanded on trigger', () => {
      openMenu(trigger, [{ label: 'X' }]);
      closeMenu();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('is safe to call when no menu is open', () => {
      expect(() => closeMenu()).not.toThrow();
    });
  });

  describe('DEFAULT_CARD_MENU', () => {
    it('is an array with expected items', () => {
      expect(Array.isArray(DEFAULT_CARD_MENU)).toBe(true);
      const labels = DEFAULT_CARD_MENU.filter((i) => i !== '-').map((i) => i.label);
      expect(labels).toContain('Refresh');
      expect(labels).toContain('Move up');
      expect(labels).toContain('Move down');
      expect(labels).toContain('Hide card');
    });

    it('contains a separator', () => {
      expect(DEFAULT_CARD_MENU).toContain('-');
    });
  });
});
