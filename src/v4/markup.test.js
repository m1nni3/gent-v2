import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  pageHeader,
  statTile,
  statusBadge,
  customerCell,
  activityItem,
  visitorRow,
  emptyState,
  banner,
  skeletonRows
} from './markup.js';

describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than and greater-than', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('handles all special characters together', () => {
    expect(escapeHtml('<a href="x" data-x=\'y\'>&</a>')).toBe(
      '&lt;a href=&quot;x&quot; data-x=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    );
  });

  it('returns empty string for null', () => {
    expect(escapeHtml(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(escapeHtml(undefined)).toBe('');
  });

  it('coerces numbers to strings', () => {
    expect(escapeHtml(42)).toBe('42');
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('pageHeader', () => {
  it('renders title', () => {
    const html = pageHeader({ title: 'Dashboard' });
    expect(html).toContain('class="page-title"');
    expect(html).toContain('Dashboard');
  });

  it('renders pretitle when provided', () => {
    const html = pageHeader({ title: 'Users', pretitle: 'Admin' });
    expect(html).toContain('class="page-pretitle"');
    expect(html).toContain('Admin');
  });

  it('omits pretitle when not provided', () => {
    const html = pageHeader({ title: 'Users' });
    expect(html).not.toContain('page-pretitle');
  });

  it('renders actionsHtml as raw HTML', () => {
    const html = pageHeader({ title: 'T', actionsHtml: '<button>Add</button>' });
    expect(html).toContain('class="page-actions"');
    expect(html).toContain('<button>Add</button>');
  });

  it('escapes title content', () => {
    const html = pageHeader({ title: '<script>alert(1)</script>' });
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert');
  });
});

describe('statTile', () => {
  it('renders label and value', () => {
    const html = statTile({ label: 'Revenue', value: '$12,000' });
    expect(html).toContain('Revenue');
    expect(html).toContain('$12,000');
  });

  it('applies color class to icon', () => {
    const html = statTile({ label: 'X', value: '1', color: 'green', iconHtml: '<svg></svg>' });
    expect(html).toContain('stat-icon green');
  });

  it('renders change indicator', () => {
    const html = statTile({ label: 'X', value: '1', change: { pct: '+5%', direction: 'up' } });
    expect(html).toContain('stat-change up');
    expect(html).toContain('+5%');
  });

  it('renders subtext', () => {
    const html = statTile({ label: 'X', value: '1', subtext: 'vs last month' });
    expect(html).toContain('stat-subtext');
    expect(html).toContain('vs last month');
  });

  it('defaults color to teal', () => {
    const html = statTile({ label: 'X', value: '1', iconHtml: '<svg/>' });
    expect(html).toContain('stat-icon teal');
  });
});

describe('statusBadge', () => {
  it('renders with color class', () => {
    const html = statusBadge('Active', 'green');
    expect(html).toContain('status status-green');
    expect(html).toContain('Active');
  });

  it('escapes label', () => {
    const html = statusBadge('<b>XSS</b>', 'red');
    expect(html).toContain('&lt;b&gt;XSS&lt;/b&gt;');
  });
});

describe('customerCell', () => {
  it('renders name and auto-generates initials', () => {
    const html = customerCell({ name: 'John Doe' });
    expect(html).toContain('JD');
    expect(html).toContain('John Doe');
  });

  it('uses provided initials', () => {
    const html = customerCell({ name: 'John Doe', initials: 'XX' });
    expect(html).toContain('XX');
  });

  it('applies custom avatar color', () => {
    const html = customerCell({ name: 'Test', avatarColor: '#f00' });
    expect(html).toContain('background:#f00');
  });

  it('handles single-word names', () => {
    const html = customerCell({ name: 'Admin' });
    expect(html).toContain('A');
  });
});

describe('activityItem', () => {
  it('renders body and time', () => {
    const html = activityItem({ bodyHtml: '<strong>Foo</strong> did something', time: '5 min ago' });
    expect(html).toContain('<strong>Foo</strong> did something');
    expect(html).toContain('5 min ago');
  });

  it('renders initials and avatar background', () => {
    const html = activityItem({ bodyHtml: 'x', time: 'now', initials: 'AB', avatarBg: 'blue' });
    expect(html).toContain('AB');
    expect(html).toContain('background:blue');
  });
});

describe('visitorRow', () => {
  it('renders name and percentage', () => {
    const html = visitorRow({ name: 'USA', pct: 45 });
    expect(html).toContain('USA');
    expect(html).toContain('45%');
  });

  it('clamps percentage to 0-100', () => {
    const over = visitorRow({ name: 'X', pct: 150 });
    expect(over).toContain('width:100%');
    const under = visitorRow({ name: 'Y', pct: -5 });
    expect(under).toContain('width:0%');
  });

  it('renders flag when provided', () => {
    const html = visitorRow({ name: 'Brazil', pct: 20, flag: 'BR' });
    expect(html).toContain('visitor-flag');
    expect(html).toContain('BR');
  });
});

describe('emptyState', () => {
  it('renders title', () => {
    const html = emptyState({ title: 'No results' });
    expect(html).toContain('empty-state-title');
    expect(html).toContain('No results');
  });

  it('renders description when provided', () => {
    const html = emptyState({ title: 'T', desc: 'Try another search' });
    expect(html).toContain('empty-state-desc');
    expect(html).toContain('Try another search');
  });

  it('renders icon and action as raw HTML', () => {
    const html = emptyState({ title: 'T', iconHtml: '<svg/>', actionHtml: '<button>Retry</button>' });
    expect(html).toContain('empty-state-icon');
    expect(html).toContain('<svg/>');
    expect(html).toContain('<button>Retry</button>');
  });
});

describe('banner', () => {
  it('renders body with default info variant', () => {
    const html = banner({ body: 'Hello' });
    expect(html).toContain('banner-info');
    expect(html).toContain('Hello');
  });

  it('renders with specified variant', () => {
    const html = banner({ body: 'Error!', variant: 'danger' });
    expect(html).toContain('banner-danger');
  });

  it('renders title as bold', () => {
    const html = banner({ body: 'msg', title: 'Warning' });
    expect(html).toContain('<strong>Warning</strong>');
  });

  it('renders icon and actions as raw HTML', () => {
    const html = banner({ body: 'x', iconHtml: '<svg/>', actionsHtml: '<button>OK</button>' });
    expect(html).toContain('banner-icon');
    expect(html).toContain('<svg/>');
    expect(html).toContain('<button>OK</button>');
  });
});

describe('skeletonRows', () => {
  it('generates correct number of rows', () => {
    const html = skeletonRows(3, 2);
    const matches = html.match(/<tr>/g);
    expect(matches).toHaveLength(2);
  });

  it('generates correct number of cells per row', () => {
    const html = skeletonRows(4, 1);
    const matches = html.match(/<td>/g);
    expect(matches).toHaveLength(4);
  });

  it('defaults to 5 rows', () => {
    const html = skeletonRows(2);
    const matches = html.match(/<tr>/g);
    expect(matches).toHaveLength(5);
  });

  it('includes skeleton class', () => {
    const html = skeletonRows(1, 1);
    expect(html).toContain('skeleton skeleton-text');
  });
});
