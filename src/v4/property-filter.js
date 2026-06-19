// Gentelella v4 — Property Data Filter
// Filters out excluded properties from all data displays.
// Excluded names: Unknown, River Hamlett, Trusst
// Data stays in the database — this is a display-level filter only.

const EXCLUDED_NAMES = ['Unknown', 'River Hamlett', 'Trusst', 'Unknown Property', 'Test Property'];

export function isPropertyExcluded(name) {
  if (!name) { return false; }
  const trimmed = name.trim().toLowerCase();
  return EXCLUDED_NAMES.some(ex => trimmed === ex.toLowerCase() || trimmed.startsWith(ex.toLowerCase()));
}

export function filterProperties(properties) {
  if (!properties || !Array.isArray(properties)) { return []; }
  return properties.filter(p => {
    const name = p.name || p.property_name || p.title || p.address || '';
    return !isPropertyExcluded(name);
  });
}

export function filterByPropertyName(items, nameField) {
  const field = nameField || 'property_name';
  if (!items || !Array.isArray(items)) { return []; }
  return items.filter(item => {
    const name = item[field] || '';
    return !isPropertyExcluded(name);
  });
}

export function getFilteredCount(total, properties) {
  const filtered = filterProperties(properties);
  return { total, visible: filtered.length, excluded: total - filtered.length };
}
