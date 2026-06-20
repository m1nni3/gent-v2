// GET /api/properties — list properties with optional filtering
// GET /api/properties/:id — single property
// POST /api/properties — create a new property
// PATCH /api/properties/:id — update a property
// DELETE /api/properties/:id — delete a property

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const VALID_STATUSES = ['Occupied', 'For Rent', 'Under Contract', 'Sold', 'Vacant', 'Available'];
const VALID_TYPES = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family'];
const VALID_REGIONS = ['Northeast', 'South', 'Midwest', 'West', 'Pacific', 'Other'];

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.replace('/api/properties', '').split('/').filter(Boolean);
  const id = pathParts[0] || null;

  const db = env.gent_v2_db;
  const kv = env.GENT_V2_KV;

  if (method === 'GET') {
    if (id) {
      const prop = await db.prepare('SELECT * FROM properties WHERE id = ?').bind(id).first();
      if (!prop) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: JSON_HEADERS });
      return new Response(JSON.stringify(prop), { headers: JSON_HEADERS });
    }

    const { status, type, region, q, limit, offset } = Object.fromEntries(url.searchParams);
    const maxLimit = Math.min(parseInt(limit || '50', 10), 200);
    const off = parseInt(offset || '0', 10);

    let sql = 'SELECT * FROM properties WHERE 1=1';
    const binds = [];

    if (status) { sql += ' AND status = ?'; binds.push(status); }
    if (type) { sql += ' AND type = ?'; binds.push(type); }
    if (region) { sql += ' AND region = ?'; binds.push(region); }
    if (q) { sql += ' AND (name LIKE ? OR address LIKE ?)'; binds.push(`%${q}%`, `%${q}%`); }

    sql += ' ORDER BY added_date DESC LIMIT ? OFFSET ?';
    binds.push(maxLimit, off);

    const items = await db.prepare(sql).bind(...binds).all();
    const countRow = await db.prepare(
      'SELECT COUNT(*) AS total FROM properties WHERE 1=1' +
      (status ? ' AND status = ?' : '') +
      (type ? ' AND type = ?' : '') +
      (region ? ' AND region = ?' : '')
    ).bind(...binds.slice(0, binds.length - 2)).first();

    return new Response(JSON.stringify({ items: items.results, total: countRow?.total || 0, limit: maxLimit, offset: off }), { headers: JSON_HEADERS });
  }

  if (method === 'POST') {
    const body = await request.json();
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'name is required' }), { status: 400, headers: JSON_HEADERS });
    }
    if (body.type && !VALID_TYPES.includes(body.type)) {
      return new Response(JSON.stringify({ error: 'invalid type' }), { status: 400, headers: JSON_HEADERS });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return new Response(JSON.stringify({ error: 'invalid status' }), { status: 400, headers: JSON_HEADERS });
    }
    if (body.region && !VALID_REGIONS.includes(body.region)) {
      return new Response(JSON.stringify({ error: 'invalid region' }), { status: 400, headers: JSON_HEADERS });
    }
    if (body.value !== undefined && (typeof body.value !== 'number' || body.value < 0)) {
      return new Response(JSON.stringify({ error: 'value must be a non-negative number' }), { status: 400, headers: JSON_HEADERS });
    }

    const result = await db.prepare(
      'INSERT INTO properties (name, address, type, value, status, region, added_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      body.name.trim(),
      body.address || body.name.trim(),
      body.type || 'Single Family',
      body.value || 0,
      body.status || 'Occupied',
      body.region || 'Other',
      body.added_date || new Date().toISOString().slice(0, 10)
    ).run();

    await kv.put('last_updated', new Date().toISOString());

    const newProp = await db.prepare('SELECT * FROM properties WHERE id = ?').bind(result.meta.last_row_id).first();
    return new Response(JSON.stringify(newProp), { status: 201, headers: JSON_HEADERS });
  }

  if (method === 'PATCH' && id) {
    const body = await request.json();
    const fields = [];
    const binds = [];
    for (const key of ['name', 'address', 'type', 'value', 'status', 'region']) {
      if (key in body) { fields.push(`${key} = ?`); binds.push(body[key]); }
    }
    if (!fields.length) return new Response(JSON.stringify({ error: 'nothing to update' }), { status: 400, headers: JSON_HEADERS });
    if (body.type && !VALID_TYPES.includes(body.type)) {
      return new Response(JSON.stringify({ error: 'invalid type' }), { status: 400, headers: JSON_HEADERS });
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return new Response(JSON.stringify({ error: 'invalid status' }), { status: 400, headers: JSON_HEADERS });
    }
    if (body.region && !VALID_REGIONS.includes(body.region)) {
      return new Response(JSON.stringify({ error: 'invalid region' }), { status: 400, headers: JSON_HEADERS });
    }
    if (body.value !== undefined && (typeof body.value !== 'number' || body.value < 0)) {
      return new Response(JSON.stringify({ error: 'value must be a non-negative number' }), { status: 400, headers: JSON_HEADERS });
    }
    binds.push(id);

    const result = await db.prepare(`UPDATE properties SET ${fields.join(', ')} WHERE id = ?`).bind(...binds).run();
    if (!result.meta.changes) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: JSON_HEADERS });
    const updated = await db.prepare('SELECT * FROM properties WHERE id = ?').bind(id).first();
    return new Response(JSON.stringify(updated), { headers: JSON_HEADERS });
  }

  if (method === 'DELETE' && id) {
    const result = await db.prepare('DELETE FROM properties WHERE id = ?').bind(id).run();
    if (!result.meta.changes) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: JSON_HEADERS });
    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
  }

  return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405, headers: JSON_HEADERS });
}
