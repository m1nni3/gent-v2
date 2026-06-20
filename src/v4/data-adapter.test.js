import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApiMode, seedAdapter, httpAdapter, HttpError } from './data-adapter.js';

describe('useApiMode', () => {
  beforeEach(() => {
    delete window.__GENTELELLA_API__;
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true
    });
  });

  it('returns false by default', () => {
    expect(useApiMode()).toBe(false);
  });

  it('returns true when window.__GENTELELLA_API__ is set', () => {
    window.__GENTELELLA_API__ = true;
    expect(useApiMode()).toBe(true);
  });

  it('returns true when ?api param is present', () => {
    window.location.search = '?api=1';
    expect(useApiMode()).toBe(true);
  });

  it('returns true when ?api param is present without value', () => {
    window.location.search = '?api';
    expect(useApiMode()).toBe(true);
  });
});

describe('seedAdapter', () => {
  const SEED = [
    { id: 1, name: 'Alice', folder: 'inbox' },
    { id: 2, name: 'Bob', folder: 'sent' },
    { id: 3, name: 'Charlie', folder: 'inbox' }
  ];
  let adapter;

  beforeEach(() => {
    adapter = seedAdapter(SEED, (item, query) => {
      if (query.folder) { return item.folder === query.folder; }
      return true;
    });
  });

  describe('list', () => {
    it('returns all items when no query filter matches', async () => {
      const items = await adapter.list();
      expect(items).toHaveLength(3);
    });

    it('filters items by query when filter function is provided', async () => {
      const items = await adapter.list({ folder: 'inbox' });
      expect(items).toHaveLength(2);
      expect(items.every((i) => i.folder === 'inbox')).toBe(true);
    });

    it('returns empty array when no items match filter', async () => {
      const items = await adapter.list({ folder: 'trash' });
      expect(items).toHaveLength(0);
    });
  });

  describe('get', () => {
    it('returns item by id', async () => {
      const item = await adapter.get(2);
      expect(item).toEqual({ id: 2, name: 'Bob', folder: 'sent' });
    });

    it('returns null for missing id', async () => {
      const item = await adapter.get(999);
      expect(item).toBeNull();
    });

    it('matches id as string', async () => {
      const item = await adapter.get('1');
      expect(item.name).toBe('Alice');
    });
  });

  describe('create', () => {
    it('adds item to the store and returns it with an id', async () => {
      const created = await adapter.create({ name: 'Dave', folder: 'inbox' });
      expect(created.id).toBeDefined();
      expect(created.name).toBe('Dave');
      const all = await adapter.list();
      expect(all).toHaveLength(4);
    });

    it('prepends the new item to the front', async () => {
      await adapter.create({ name: 'First' });
      const all = await adapter.list();
      expect(all[0].name).toBe('First');
    });

    it('assigns incrementing ids', async () => {
      const a = await adapter.create({ name: 'X' });
      const b = await adapter.create({ name: 'Y' });
      expect(b.id).toBe(a.id + 1);
    });
  });

  describe('update', () => {
    it('patches an existing item', async () => {
      const updated = await adapter.update(1, { name: 'Alice Updated' });
      expect(updated.name).toBe('Alice Updated');
      expect(updated.folder).toBe('inbox');
    });

    it('returns null for missing id', async () => {
      const result = await adapter.update(999, { name: 'X' });
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('removes an existing item and returns true', async () => {
      const result = await adapter.remove(2);
      expect(result).toBe(true);
      const all = await adapter.list();
      expect(all).toHaveLength(2);
    });

    it('returns false for non-existent id', async () => {
      const result = await adapter.remove(999);
      expect(result).toBe(false);
    });
  });

  describe('reset', () => {
    it('restores original seed data', async () => {
      await adapter.create({ name: 'Extra' });
      await adapter.remove(1);
      adapter.reset();
      const all = await adapter.list();
      expect(all).toHaveLength(3);
      expect(all[0].id).toBe(1);
    });
  });

  describe('without filter', () => {
    it('list returns a copy of the store', async () => {
      const plain = seedAdapter(SEED);
      const all = await plain.list();
      expect(all).toHaveLength(3);
      expect(all).not.toBe(SEED);
    });
  });
});

describe('httpAdapter', () => {
  let mockFetch;
  let adapter;

  beforeEach(() => {
    mockFetch = vi.fn();
    adapter = httpAdapter('/api/items', { fetch: mockFetch });
  });

  function ok(data) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
  }

  function fail(status, text) {
    return Promise.resolve({
      ok: false,
      status,
      statusText: text || 'Error',
      text: () => Promise.resolve(text || '')
    });
  }

  describe('list', () => {
    it('fetches baseUrl with no query when empty', async () => {
      mockFetch.mockReturnValue(ok([{ id: 1 }]));
      const result = await adapter.list();
      expect(mockFetch).toHaveBeenCalledWith('/api/items');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('appends query params', async () => {
      mockFetch.mockReturnValue(ok([]));
      await adapter.list({ folder: 'inbox', status: 'unread' });
      expect(mockFetch).toHaveBeenCalledWith('/api/items?folder=inbox&status=unread');
    });

    it('extracts array using listKey', async () => {
      const keyAdapter = httpAdapter('/api/items', { fetch: mockFetch, listKey: 'data' });
      mockFetch.mockReturnValue(ok({ data: [{ id: 1 }], total: 1 }));
      const result = await keyAdapter.list();
      expect(result).toEqual([{ id: 1 }]);
    });

    it('returns empty array when listKey is missing from response', async () => {
      const keyAdapter = httpAdapter('/api/items', { fetch: mockFetch, listKey: 'data' });
      mockFetch.mockReturnValue(ok({ items: [{ id: 1 }] }));
      const result = await keyAdapter.list();
      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('fetches by id', async () => {
      mockFetch.mockReturnValue(ok({ id: 5, name: 'Test' }));
      const result = await adapter.get(5);
      expect(mockFetch).toHaveBeenCalledWith('/api/items/5');
      expect(result).toEqual({ id: 5, name: 'Test' });
    });

    it('encodes special characters in id', async () => {
      mockFetch.mockReturnValue(ok({}));
      await adapter.get('a/b');
      expect(mockFetch).toHaveBeenCalledWith('/api/items/a%2Fb');
    });
  });

  describe('create', () => {
    it('posts JSON body', async () => {
      mockFetch.mockReturnValue(ok({ id: 10, name: 'New' }));
      const result = await adapter.create({ name: 'New' });
      expect(mockFetch).toHaveBeenCalledWith('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New' })
      });
      expect(result).toEqual({ id: 10, name: 'New' });
    });
  });

  describe('update', () => {
    it('sends PATCH with JSON body', async () => {
      mockFetch.mockReturnValue(ok({ id: 1, name: 'Updated' }));
      const result = await adapter.update(1, { name: 'Updated' });
      expect(mockFetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' })
      });
      expect(result).toEqual({ id: 1, name: 'Updated' });
    });
  });

  describe('remove', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockReturnValue(ok({ ok: true }));
      const result = await adapter.remove(3);
      expect(mockFetch).toHaveBeenCalledWith('/api/items/3', { method: 'DELETE' });
      expect(result).toEqual({ ok: true });
    });
  });

  describe('error handling', () => {
    it('throws HttpError on non-ok response', async () => {
      mockFetch.mockReturnValue(fail(404, 'Not Found'));
      await expect(adapter.get(999)).rejects.toThrow(HttpError);
      await expect(adapter.get(999)).rejects.toThrow('HTTP 404');
    });

    it('HttpError has status property', async () => {
      mockFetch.mockReturnValue(fail(500, 'Server Error'));
      try {
        await adapter.list();
      } catch (e) {
        expect(e).toBeInstanceOf(HttpError);
        expect(e.status).toBe(500);
        expect(e.name).toBe('HttpError');
      }
    });
  });
});

describe('HttpError', () => {
  it('extends Error', () => {
    const err = new HttpError(404, 'Not Found');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('HTTP 404: Not Found');
    expect(err.status).toBe(404);
    expect(err.name).toBe('HttpError');
  });
});
