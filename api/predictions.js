const TABLE = 'aa_wc_predictions';

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  return { url: url.replace(/\/$/, ''), key };
}

async function supabaseFetch(path, options = {}) {
  const config = supabaseConfig();
  if (!config) {
    const error = new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable in Vercel.');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }

  if (!response.ok) {
    const error = new Error(body?.message || body?.error || `Supabase returned ${response.status}`);
    error.statusCode = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function rowsToPredictionMap(rows) {
  return (rows || []).reduce((acc, row) => {
    acc[row.match_id] = row.picks || {};
    return acc;
  }, {});
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const rows = await supabaseFetch(`${TABLE}?select=match_id,picks&order=match_id.asc`);
      return res.status(200).json({ predictions: rowsToPredictionMap(rows) });
    }

    if (req.method === 'POST') {
      const { matchId, picks } = req.body || {};
      const numericMatchId = Number(matchId);

      if (!Number.isInteger(numericMatchId) || numericMatchId <= 0) {
        return res.status(400).json({ error: 'matchId must be a positive integer.' });
      }

      if (!picks || typeof picks !== 'object' || Array.isArray(picks)) {
        return res.status(400).json({ error: 'picks must be an object.' });
      }

      await supabaseFetch(`${TABLE}?on_conflict=match_id`, {
        method: 'POST',
        headers: {
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          match_id: numericMatchId,
          picks,
          updated_at: new Date().toISOString()
        })
      });

      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Prediction storage failed.',
      details: error.body || undefined
    });
  }
};
