// Gentelella v4 — Property Management Page Actions
// Wires up data-modal buttons and property-specific interactions.

import { showModal } from './modal.js';
import { showToast } from './toast.js';

export function initPropertyActions() {
  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalName = btn.dataset.modal;
      showModal(getModalConfig(modalName));
    });
  });
}

export function initActions() {
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.dataset.action;
      const config = MODAL_CONFIGS[action];
      if (config && typeof config.action === 'function') {
        config.action();
      }
    });
  });
}

const MODAL_CONFIGS = {
  'add-property': {
    title: 'Add Property',
    body: '<div class="property-form"><div class="form-group"><label class="form-label">Property Name</label><input type="text" class="form-input" placeholder="Enter property name"></div><div class="form-group"><label class="form-label">Address</label><input type="text" class="form-input" placeholder="Full address"></div><div class="form-group"><label class="form-label">Type</label><select class="form-select"><option>Single Family</option><option>Condo</option><option>Townhouse</option><option>Multi-Family</option></select></div><div class="form-group"><label class="form-label">Value</label><input type="text" class="form-input" placeholder="$0.00"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Property added ✓', { variant: 'success' }) }
    ]
  },
  'edit-property': {
    title: 'Edit Property',
    body: '<div class="property-form"><div class="form-group"><label class="form-label">Property Name</label><input type="text" class="form-input" value="123 Main St"></div><div class="form-group"><label class="form-label">Value</label><input type="text" class="form-input" value="$485,000"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Property updated ✓', { variant: 'success' }) }
    ]
  },
  'add-transaction': {
    title: 'Add Transaction',
    body: '<div class="transaction-form"><div class="form-group"><label class="form-label">Description</label><input type="text" class="form-input" placeholder="Transaction description"></div><div class="form-group"><label class="form-label">Amount</label><input type="text" class="form-input" placeholder="$0.00"></div><div class="form-group"><label class="form-label">Type</label><select class="form-select"><option>Income</option><option>Expense</option></select></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Transaction added ✓', { variant: 'success' }) }
    ]
  },
  'add-entry': {
    title: 'Add Entry',
    body: '<div class="entry-form"><div class="form-group"><label class="form-label">Entry Details</label><input type="text" class="form-input" placeholder="Entry description"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Entry added ✓', { variant: 'success' }) }
    ]
  },
  'add-contact': {
    title: 'Add Contact',
    body: '<div class="contact-form"><div class="form-group"><label class="form-label">Name</label><input type="text" class="form-input" placeholder="Full name"></div><div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" placeholder="email@example.com"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Contact saved ✓', { variant: 'success' }) }
    ]
  },
  'add-expense': {
    title: 'Add Expense',
    body: '<div class="expense-form"><div class="form-group"><label class="form-label">Description</label><input type="text" class="form-input" placeholder="Expense description"></div><div class="form-group"><label class="form-label">Amount</label><input type="text" class="form-input" placeholder="$0.00"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Expense added ✓', { variant: 'success' }) }
    ]
  },
  'add-portal': {
    title: 'Add Portal',
    body: '<div class="portal-form"><div class="form-group"><label class="form-label">Portal Name</label><input type="text" class="form-input" placeholder="Portal name"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Portal created ✓', { variant: 'success' }) }
    ]
  },
  'add-policy': {
    title: 'Add Policy',
    body: '<div class="policy-form"><div class="form-group"><label class="form-label">Policy Name</label><input type="text" class="form-input" placeholder="Policy name"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Policy added ✓', { variant: 'success' }) }
    ]
  },
  'new-debrief': {
    title: 'New Debrief',
    body: '<div class="debrief-form"><div class="form-group"><label class="form-label">Debrief Title</label><input type="text" class="form-input" placeholder="Debrief title"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Create', variant: 'primary', action: () => showToast('Debrief created ✓', { variant: 'success' }) }
    ]
  },
  'add-payment': {
    title: 'Record Payment',
    body: '<div class="payment-form"><div class="form-group"><label class="form-label">Amount</label><input type="text" class="form-input" placeholder="$0.00"></div><div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Payment recorded ✓', { variant: 'success' }) }
    ]
  },
  'add-note': {
    title: 'Add Note',
    body: '<div class="note-form"><div class="form-group"><label class="form-label">Note</label><textarea class="form-input" rows="4" placeholder="Enter note"></textarea></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Note added ✓', { variant: 'success' }) }
    ]
  },
  'schedule-inspection': {
    title: 'Schedule Inspection',
    body: '<div class="inspection-form"><div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input"></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Schedule', variant: 'primary', action: () => showToast('Inspection scheduled ✓', { variant: 'success' }) }
    ]
  },
  'edit-portal': {
    title: 'Edit Portal',
    body: '<div class="portal-form"><div class="form-group"><label class="form-label">Portal Settings</label><p>Configure portal settings here</p></div></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Save', variant: 'primary', action: () => showToast('Portal updated ✓', { variant: 'success' }) }
    ]
  },
  'bulk-import': {
    title: 'Bulk Import Properties',
    body: '<div class="import-form"><div class="form-group"><label class="form-label">Upload CSV</label><input type="file" class="form-input" accept=".csv"></div><p style="font-size:12px;color:var(--text-muted)">CSV must include: name, address, type, value</p></div>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Import', variant: 'primary', action: () => showToast('Import started ✓', { variant: 'success' }) }
    ]
  }
};

function getModalConfig(name) {
  return MODAL_CONFIGS[name] || { title: name, body: '<p>Modal content</p>', actions: [{ label: 'Close', variant: 'ghost' }] };
}
