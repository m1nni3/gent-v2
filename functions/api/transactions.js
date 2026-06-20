// GET /api/transactions — list transactions
// POST /api/transactions — create a transaction

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  const db = env.gent_v2_db;

  try {
    return await handleRequest({ request, url, method, db });
  } catch (err) {
    const status = err.status || 500;
    const message = status === 500 ? 'internal server error' : err.message;
    return new Response(JSON.stringify({ error: message }), { status });
  }
}

async function handleRequest({ request, url, method, db }) {
  if (method === 'GET') {
    const { type, limit, offset } = Object.fromEntries(url.searchParams);
    const maxLimit = Math.min(parseInt(limit || '50', 10), 200);
    const off = parseInt(offset || '0', 10);

    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const binds = [];

    if (type) { sql += ' AND type = ?'; binds.push(type); }

    sql += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    binds.push(maxLimit, off);

    const items = await db.prepare(sql).bind(...binds).all();
    const countRow = await db.prepare(
      'SELECT COUNT(*) AS total FROM transactions' + (type ? ' WHERE type = ?' : '')
    ).bind(...(type ? [type] : [])).first();

    return new Response(JSON.stringify({ items: items.results, total: countRow?.total || 0 }));
  }

  if (method === 'POST') {
    let body;
    try { body = await request.json(); } catch (_e) {
      return new Response(JSON.stringify({ error: 'invalid JSON body' }), { status: 400 });
    }
    const result = await db.prepare(
      'INSERT INTO transactions (property, type, amount, description, date, contact) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      body.property || '',
      body.type || 'Income',
      body.amount || 0,
      body.description || '',
      body.date || new Date().toISOString().slice(0, 10),
      body.contact || ''
    ).run();

    const newTx = await db.prepare('SELECT * FROM transactions WHERE id = ?').bind(result.meta.last_row_id).first();
    return new Response(JSON.stringify(newTx), { status: 201 });
  }

  return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405 });
}

