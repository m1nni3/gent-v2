// GET /api/contacts — list contacts
// POST /api/contacts — create a contact

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  const db = env.gent_v2_db;

  if (method === 'GET') {
    const { role, limit, offset } = Object.fromEntries(url.searchParams);
    const maxLimit = Math.min(parseInt(limit || '50', 10), 200);
    const off = parseInt(offset || '0', 10);

    let sql = 'SELECT * FROM contacts WHERE 1=1';
    const binds = [];

    if (role) { sql += ' AND role = ?'; binds.push(role); }

    sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    binds.push(maxLimit, off);

    const items = await db.prepare(sql).bind(...binds).all();
    const countRow = await db.prepare(
      'SELECT COUNT(*) AS total FROM contacts' + (role ? ' WHERE role = ?' : '')
    ).bind(...(role ? [role] : [])).first();

    return new Response(JSON.stringify({ items: items.results, total: countRow?.total || 0 }));
  }

  if (method === 'POST') {
    const body = await request.json();
    const result = await db.prepare(
      'INSERT INTO contacts (name, email, role, property) VALUES (?, ?, ?, ?)'
    ).bind(
      body.name || '',
      body.email || '',
      body.role || 'Tenant',
      body.property || ''
    ).run();

    const newContact = await db.prepare('SELECT * FROM contacts WHERE id = ?').bind(result.meta.last_row_id).first();
    return new Response(JSON.stringify(newContact), { status: 201 });
  }

  return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405 });
}
