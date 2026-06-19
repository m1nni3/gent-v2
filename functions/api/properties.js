// GET /api/properties — list properties with optional filtering
// GET /api/properties/:id — single property
// POST /api/properties — create a new property
// PATCH /api/properties/:id — update a property
// DELETE /api/properties/:id — delete a property

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
      if (!prop) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
      return new Response(JSON.stringify(prop));
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

    return new Response(JSON.stringify({ items: items.results, total: countRow?.total || 0, limit: maxLimit, offset: off }));
  }

  if (method === 'POST') {
    const body = await request.json();
    if (!body.name) return new Response(JSON.stringify({ error: 'name is required' }), { status: 400 });

    const result = await db.prepare(
      'INSERT INTO properties (name, address, type, value, status, region, added_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      body.name,
      body.address || body.name,
      body.type || 'Single Family',
      body.value || 0,
      body.status || 'Occupied',
      body.region || 'Other',
      body.added_date || new Date().toISOString().slice(0, 10)
    ).run();

    await kv.put('last_updated', new Date().toISOString());

    const newProp = await db.prepare('SELECT * FROM properties WHERE id = ?').bind(result.meta.last_row_id).first();
    return new Response(JSON.stringify(newProp), { status: 201 });
  }

  if (method === 'PATCH' && id) {
    const body = await request.json();
    const fields = [];
    const binds = [];
    for (const key of ['name', 'address', 'type', 'value', 'status', 'region']) {
      if (key in body) { fields.push(`${key} = ?`); binds.push(body[key]); }
    }
    if (!fields.length) return new Response(JSON.stringify({ error: 'nothing to update' }), { status: 400 });
    binds.push(id);

    const result = await db.prepare(`UPDATE properties SET ${fields.join(', ')} WHERE id = ?`).bind(...binds).run();
    if (!result.meta.changes) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
    const updated = await db.prepare('SELECT * FROM properties WHERE id = ?').bind(id).first();
    return new Response(JSON.stringify(updated));
  }

  if (method === 'DELETE' && id) {
    const result = await db.prepare('DELETE FROM properties WHERE id = ?').bind(id).run();
    if (!result.meta.changes) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
    return new Response(JSON.stringify({ ok: true }));
  }

  return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405 });
}
