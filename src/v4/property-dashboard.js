// Gentelella v4 — Property Dashboard
// Integrates API adapters with the property management dashboard page.
// Lazy-imported by main-v4.js when data-page="properties-dashboard" is present.
//
// Two modes:
//   Static (default) — seed data is used.
//   API mode         — set ?api=1 or window.__GENTELELLA_API__ = true

import { useApiMode, httpAdapter, seedAdapter } from './data-adapter.js';
import { filterProperties } from './property-filter.js';
import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { getChartInstance } from './charts.js';

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Seed data ────────────────────────────────────────────────────────────

const SEED = {
  properties: [
    { id: 8421, name: '123 Main St, NYC', type: 'Single Family', value: 485000, status: 'Occupied', region: 'Northeast', added_date: '2026-06-14' },
    { id: 8420, name: '456 Park Ave, LA', type: 'Condo', value: 325000, status: 'For Rent', region: 'West', added_date: '2026-06-13' },
    { id: 8419, name: '789 Oak St, Chicago', type: 'Townhouse', value: 275000, status: 'Under Contract', region: 'Midwest', added_date: '2026-06-12' },
    { id: 8418, name: '101 Pine St, Seattle', type: 'Single Family', value: 420000, status: 'Occupied', region: 'Pacific', added_date: '2026-06-11' },
    { id: 8417, name: '202 Elm St, Boston', type: 'Condo', value: 295000, status: 'Sold', region: 'Northeast', added_date: '2026-06-10' },
    { id: 8416, name: '303 Maple Dr, Austin', type: 'Single Family', value: 380000, status: 'Occupied', region: 'South', added_date: '2026-06-09' },
    { id: 8415, name: '404 Cedar Ln, Denver', type: 'Townhouse', value: 310000, status: 'For Rent', region: 'West', added_date: '2026-06-08' },
    { id: 8414, name: '505 Birch Blvd, Miami', type: 'Condo', value: 450000, status: 'Occupied', region: 'South', added_date: '2026-06-07' },
    { id: 8413, name: '606 Walnut Ave, Portland', type: 'Multi-Family', value: 550000, status: 'Occupied', region: 'Pacific', added_date: '2026-06-06' },
    { id: 8412, name: '707 Spruce Ct, Atlanta', type: 'Single Family', value: 340000, status: 'Under Contract', region: 'South', added_date: '2026-06-05' },
    { id: 8411, name: '808 Ash St, Phoenix', type: 'Condo', value: 280000, status: 'Vacant', region: 'West', added_date: '2026-06-04' },
    { id: 8410, name: '909 Poplar Rd, Dallas', type: 'Townhouse', value: 320000, status: 'Occupied', region: 'South', added_date: '2026-06-03' },
    { id: 8409, name: '111 Birch Way, NYC', type: 'Condo', value: 520000, status: 'Occupied', region: 'Northeast', added_date: '2026-06-02' },
    { id: 8408, name: '222 Elm Ct, SF', type: 'Single Family', value: 680000, status: 'For Rent', region: 'West', added_date: '2026-06-01' },
    { id: 8407, name: '333 Oak Ave, Chicago', type: 'Multi-Family', value: 490000, status: 'Occupied', region: 'Midwest', added_date: '2026-05-31' },
    { id: 8406, name: '444 Pine Dr, Boston', type: 'Single Family', value: 410000, status: 'Vacant', region: 'Northeast', added_date: '2026-05-30' },
    { id: 8405, name: '555 Maple Ln, Denver', type: 'Condo', value: 295000, status: 'Occupied', region: 'West', added_date: '2026-05-29' },
    { id: 8404, name: '666 Cedar St, Austin', type: 'Townhouse', value: 365000, status: 'Occupied', region: 'South', added_date: '2026-05-28' },
    { id: 8403, name: '777 Spruce Ave, Seattle', type: 'Single Family', value: 445000, status: 'Under Contract', region: 'Pacific', added_date: '2026-05-27' },
    { id: 8402, name: '888 Walnut Ct, Miami', type: 'Condo', value: 470000, status: 'Occupied', region: 'South', added_date: '2026-05-26' }
  ],
  transactions: [
    { id: 1, property: '123 Main St', type: 'Income', amount: 3450, description: 'Rent payment', date: '2026-06-14', contact: 'Sarah K.' },
    { id: 2, property: '456 Park Ave', type: 'Expense', amount: 1200, description: 'Maintenance request', date: '2026-06-14', contact: 'Michael R.' },
    { id: 3, property: '789 Oak St', type: 'Income', amount: 4500, description: 'Security deposit', date: '2026-06-13', contact: 'Emily T.' },
    { id: 4, property: '101 Pine St', type: 'Expense', amount: 350, description: 'Inspection fee', date: '2026-06-12', contact: 'John L.' },
    { id: 5, property: '202 Elm St', type: 'Income', amount: 3200, description: 'Rent payment', date: '2026-06-12', contact: 'David W.' },
    { id: 6, property: '303 Maple Dr', type: 'Income', amount: 2800, description: 'Rent payment', date: '2026-06-11', contact: 'Lisa M.' },
    { id: 7, property: '404 Cedar Ln', type: 'Expense', amount: 560, description: 'Plumbing repair', date: '2026-06-10', contact: 'Tom H.' },
    { id: 8, property: '505 Birch Blvd', type: 'Income', amount: 3800, description: 'Rent payment', date: '2026-06-10', contact: 'Anna P.' }
  ],
  contacts: [
    { id: 1, name: 'Sarah K.', email: 'sarah.k@example.com', role: 'Tenant', property: '123 Main St' },
    { id: 2, name: 'Michael R.', email: 'michael.r@example.com', role: 'Tenant', property: '456 Park Ave' },
    { id: 3, name: 'Emily T.', email: 'emily.t@example.com', role: 'Tenant', property: '789 Oak St' },
    { id: 4, name: 'John L.', email: 'john.l@example.com', role: 'Contractor', property: '' },
    { id: 5, name: 'David W.', email: 'david.w@example.com', role: 'Tenant', property: '202 Elm St' }
  ]
};

// ── Status helpers ───────────────────────────────────────────────────────

const STATUS_CLASS = {
  Occupied: 'green',
  'For Rent': 'blue',
  'Under Contract': 'yellow',
  Sold: 'red',
  Vacant: 'red',
  Available: 'blue'
};

const AVATAR_COLORS = ['var(--primary)', 'var(--azure)', 'var(--purple)', 'var(--green)', 'var(--red)', 'var(--yellow)'];

// ── Data loading ─────────────────────────────────────────────────────────

function createAdapters() {
  const api = useApiMode();
  return {
    properties: api ? httpAdapter('/api/properties', { listKey: 'items' }) : seedAdapter(SEED.properties),
    transactions: api ? httpAdapter('/api/transactions', { listKey: 'items' }) : seedAdapter(SEED.transactions),
    contacts: api ? httpAdapter('/api/contacts', { listKey: 'items' }) : seedAdapter(SEED.contacts)
  };
}

async function loadAll(adapters) {
  const [properties, transactions, contacts] = await Promise.all([
    adapters.properties.list(),
    adapters.transactions.list(),
    adapters.contacts.list()
  ]);
  const filtered = filterProperties(properties);
  return { properties: filtered, transactions, contacts, rawProperties: properties };
}

// ── Rendering ────────────────────────────────────────────────────────────

function renderStats(data) {
  const props = data.properties;
  const total = props.length;
  const occupied = props.filter((p) => p.status === 'Occupied').length;
  const vacant = props.filter((p) => p.status === 'Vacant' || p.status === 'For Rent').length;
  const avgValue = total ? Math.round(props.reduce((s, p) => s + (p.value || 0), 0) / total) : 0;
  const annualRevenue = props.reduce((s, p) => s + (p.value || 0) * 0.06, 0);
  const maintenanceCost = props.reduce((s, p) => s + (p.value || 0) * 0.004, 0);

  const stats = [
    { selector: '.stat-icon.blue + .stat-content .stat-value', value: total.toLocaleString() },
    { selector: '.stat-icon.green + .stat-content .stat-value', value: occupied.toLocaleString() },
    { selector: '.stat-icon.yellow + .stat-content .stat-value', value: '$' + (avgValue / 1000).toFixed(0) + 'K' },
    { selector: '.stat-icon.red + .stat-content .stat-value', value: vacant.toLocaleString() },
    { selector: '.stat-icon.purple + .stat-content .stat-value', value: '$' + (annualRevenue / 1e6).toFixed(1) + 'M' },
    { selector: '.stat-icon.teal + .stat-content .stat-value', value: '$' + (maintenanceCost / 1e6).toFixed(1) + 'M' }
  ];

  stats.forEach((s) => {
    const el = document.querySelector(s.selector);
    if (el) {el.textContent = s.value;}
  });

  // Update subtexts
  const subtexts = document.querySelectorAll('.stat-subtext');
  if (subtexts[0]) {subtexts[0].textContent = '+0 this month';}
  if (subtexts[1]) {subtexts[1].textContent = `${((occupied / total) * 100).toFixed(1)}% occupancy rate`;}
  if (subtexts[2]) {subtexts[2].textContent = '$0 market avg';}
  if (subtexts[3]) {subtexts[3].textContent = `${((vacant / total) * 100).toFixed(1)}% vacancy rate`;}
  if (subtexts[4]) {subtexts[4].textContent = `$${(annualRevenue / 12 / 1e6).toFixed(1)}M monthly`;}
  if (subtexts[5]) {subtexts[5].textContent = '$0 savings Q3';}

  // Update the chart stat header
  const chartStat = document.querySelector('.chart-stat');
  if (chartStat) {
    chartStat.innerHTML = escapeHtml('$' + (avgValue / 1000).toFixed(0) + 'K') + ' <span style="font-size:13px;font-weight:500;color:var(--green)">0%</span>';
  }
}

function renderPropertyTypes(props) {
  const typeCount = {};
  props.forEach((p) => {
    const t = p.type || 'Other';
    typeCount[t] = (typeCount[t] || 0) + 1;
  });

  const typeOrder = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family'];
  const typeColors = ['var(--primary)', 'var(--azure)', 'var(--yellow)', 'var(--green)'];
  const total = props.length || 1;

  const rows = document.querySelectorAll('.property-type-row');
  rows.forEach((row, i) => {
    if (i >= typeOrder.length) {return;}
    const label = row.querySelector('.property-type-label');
    const fill = row.querySelector('.fill');
    const value = row.querySelector('.property-type-value');
    if (label) {label.textContent = typeOrder[i];}
    const pct = ((typeCount[typeOrder[i]] || 0) / total * 100).toFixed(0);
    if (fill) {
      fill.style.width = pct + '%';
      fill.style.background = typeColors[i] || 'var(--primary)';
    }
    if (value) {value.textContent = pct + '%';}
  });
}

function renderTable(props) {
  const tbody = document.querySelector('table[data-datatable] tbody');
  if (!tbody) {return;}

  // DataTables 2 might be initialized — try to clear via DataTable API first
  const dtContainer = tbody.closest('.dt-container');
  let dtApi = null;
  if (dtContainer && window.DataTable) {
    dtApi = window.DataTable.Api ? new window.DataTable.Api(tbody.closest('table')) : null;
  }

  tbody.innerHTML = props.slice(0, 10).map((p) => {
    const cls = STATUS_CLASS[p.status] || 'green';
    const abbr = (p.name || p.address || 'Prop').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3) || 'P';
    const avatarIdx = Math.abs(p.id || 0) % AVATAR_COLORS.length;
    const added = p.added_date ? new Date(p.added_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
    return `
      <tr>
        <td class="cell-mono">#P-${escapeHtml(String(p.id))}</td>
        <td><div class="cell-customer"><div class="cell-avatar" style="background:${AVATAR_COLORS[avatarIdx]}">${escapeHtml(abbr)}</div><span class="cell-strong">${escapeHtml(p.name || p.address || p.title || '')}</span></div></td>
        <td>${escapeHtml(p.type || '—')}</td>
        <td class="cell-strong">$${escapeHtml((p.value || 0).toLocaleString())}</td>
        <td><span class="status status-${cls}">${escapeHtml(p.status || '—')}</span></td>
        <td>${escapeHtml(added)}</td>
      </tr>`;
  }).join('');

  // Re-draw DataTable if initialized
  if (dtApi && typeof dtApi.draw === 'function') {
    dtApi.draw();
  }
}

function renderRegions(props) {
  const regionCount = {};
  const regionStats = {};
  props.forEach((p) => {
    const r = p.region || 'Other';
    regionCount[r] = (regionCount[r] || 0) + 1;
    if (p.status === 'Occupied') {regionStats[r] = (regionStats[r] || 0) + 1;}
  });

  const regionOrder = ['Northeast', 'South', 'Midwest', 'West', 'Pacific'];
  const regionColors = ['var(--primary)', 'var(--azure)', 'var(--yellow)', 'var(--green)', 'var(--purple)'];

  const rows = document.querySelectorAll('.region-row');
  rows.forEach((row, i) => {
    if (i >= regionOrder.length) {return;}
    const r = regionOrder[i];
    const total = regionCount[r] || 0;
    const occ = regionStats[r] || 0;
    const pct = total ? Math.round((occ / total) * 100) : 0;

    const label = row.querySelector('.region-label');
    const fill = row.querySelector('.fill');
    const value = row.querySelector('.region-value');
    if (label) {label.textContent = r;}
    if (fill) {
      fill.style.width = pct + '%';
      fill.style.background = regionColors[i] || 'var(--primary)';
    }
    if (value) {value.textContent = pct + '%';}
  });
}

function renderFinances(props) {
  const totalValue = props.reduce((s, p) => s + (p.value || 0), 0);
  const monthlyRent = Math.round(totalValue * 0.005);
  const maintenance = Math.round(totalValue * 0.0004);
  const taxes = Math.round(totalValue * 0.0003);
  const insurance = Math.round(totalValue * 0.00007);

  const financeEls = document.querySelectorAll('.finance-row');
  const values = [monthlyRent, maintenance, taxes, insurance, monthlyRent - maintenance - taxes - insurance];
  const changes = ['+0%', '—', '—', '—', '—'];

  financeEls.forEach((row, i) => {
    if (i >= values.length) {return;}
    const val = row.querySelector('.finance-value');
    const change = row.querySelector('.finance-change');
    if (val) {val.textContent = '$' + (values[i] / 1e3).toFixed(1) + 'K';}
    if (change) {change.textContent = changes[i];}
  });
}

function renderActivities(data) {
  const list = document.querySelector('.activity-list');
  if (!list) {return;}

  const txs = data.transactions || [];
  const recent = txs.slice(0, 5);

  list.innerHTML = recent.map((tx) => {
    const initial = (tx.contact || tx.description || '?').charAt(0).toUpperCase();
    const colorIdx = Math.abs(tx.id || 0) % AVATAR_COLORS.length;
    const time = tx.date ? relativeTime(tx.date) : 'recent';
    const body = tx.type === 'Income'
      ? `<strong>Payment</strong> received — <strong>$${escapeHtml((tx.amount || 0).toLocaleString())}</strong> from <strong>${escapeHtml(tx.property || 'Unknown')}</strong>`
      : `<strong>${escapeHtml(tx.contact || tx.description)}</strong> — <strong>$${escapeHtml((tx.amount || 0).toLocaleString())}</strong>`;
    return `
      <li class="activity-item">
        <div class="activity-avatar" style="background:linear-gradient(135deg,${AVATAR_COLORS[colorIdx]},${AVATAR_COLORS[(colorIdx + 1) % AVATAR_COLORS.length]})">${escapeHtml(initial)}</div>
        <div>
          <div class="activity-body">${body}</div>
          <div class="activity-time">${escapeHtml(time)}</div>
        </div>
      </li>`;
  }).join('');
}

function relativeTime(dateStr) {
  if (!dateStr) {return 'recent';}
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.round(diff / 60000);
  if (mins < 1) {return 'just now';}
  if (mins < 60) {return mins + ' min ago';}
  const hours = Math.round(mins / 60);
  if (hours < 24) {return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';}
  const days = Math.round(hours / 24);
  return days + ' day' + (days > 1 ? 's' : '') + ' ago';
}

function renderChart(props) {
  const chartEl = document.querySelector('[data-chart="property-value-trend"]');
  if (!chartEl) {return;}

  // Build monthly value trend from property data
  const now = new Date();
  const months = [];
  const values = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-US', { month: 'short' }));
    // Simulate trend from property values with some temporal spread
    const avg = props.length ? props.reduce((s, p) => s + (p.value || 0), 0) / props.length : 485000;
    const offset = (i - 2.5) * 12000 + (Math.random() - 0.5) * 8000;
    values.push(Math.round(avg + offset));
  }

  const instance = getChartInstance('property-value-trend');
  if (instance) {
    instance.setOption({
      xAxis: { data: months },
      series: [{ data: values }]
    });
  }
}

// ── Modal wiring ─────────────────────────────────────────────────────────

function wireModals(adapters) {
  document.querySelectorAll('[data-modal="add-property"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showModal({
        title: 'Add Property',
        body: `
          <div class="property-form">
            <div class="form-group">
              <label class="form-label">Property Name</label>
              <input type="text" class="form-input" id="prop-name" placeholder="Enter property name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Address</label>
              <input type="text" class="form-input" id="prop-address" placeholder="Full address">
            </div>
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-select" id="prop-type">
                <option>Single Family</option>
                <option>Condo</option>
                <option>Townhouse</option>
                <option>Multi-Family</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Value</label>
              <input type="number" class="form-input" id="prop-value" placeholder="0">
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" id="prop-status">
                <option>Occupied</option>
                <option>For Rent</option>
                <option>Under Contract</option>
                <option>Vacant</option>
                <option>Sold</option>
              </select>
            </div>
          </div>`,
        actions: [
          { label: 'Cancel', variant: 'ghost' },
          {
            label: 'Save',
            variant: 'primary',
            action: async (ctx) => {
              const name = ctx.body.querySelector('#prop-name')?.value;
              if (!name) {
                showToast('Name is required', { variant: 'danger' });
                return false;
              }
              const data = {
                name,
                address: ctx.body.querySelector('#prop-address')?.value || name,
                type: ctx.body.querySelector('#prop-type')?.value || 'Single Family',
                value: parseInt(ctx.body.querySelector('#prop-value')?.value || '0', 10),
                status: ctx.body.querySelector('#prop-status')?.value || 'Occupied',
                region: 'Other',
                added_date: new Date().toISOString().slice(0, 10)
              };
              await adapters.properties.create(data);
              showToast('Property added ✓', { variant: 'success' });
              refreshDashboard(adapters);
            }
          }
        ]
      });
    });
  });
}

// ── Refresh ──────────────────────────────────────────────────────────────

let _refreshTimer = null;

async function refreshDashboard(adapters) {
  const data = await loadAll(adapters);
  renderAll(data);
}

function renderAll(data) {
  renderStats(data);
  renderPropertyTypes(data.properties);
  renderTable(data.properties);
  renderRegions(data.properties);
  renderFinances(data.properties);
  renderActivities(data);
  renderChart(data.properties);
}

// ── Init ─────────────────────────────────────────────────────────────────

let _initialized = false;

async function waitForCharts(retries = 30) {
  for (let i = 0; i < retries; i += 1) {
    if (getChartInstance('property-value-trend')) {return;}
    await new Promise((r) => setTimeout(r, 50));
  }
}

export async function initPropertyDashboard() {
  if (_initialized) {return;}
  _initialized = true;

  await waitForCharts();

  const adapters = createAdapters();
  const data = await loadAll(adapters);
  renderAll(data);
  wireModals(adapters);
}
