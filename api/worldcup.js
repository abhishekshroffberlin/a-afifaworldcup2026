const API_BASE = 'https://api.football-data.org/v4';

module.exports = async function handler(req, res) {
  const token = process.env.FOOTBALL_DATA_API_TOKEN;
  if (!token) {
    return res.status(500).json({
      error: 'Missing FOOTBALL_DATA_API_TOKEN environment variable in Vercel.'
    });
  }

  const type = req.query.type || 'matches';
  const season = req.query.season || '2026';
  const allowedTypes = new Set(['matches', 'standings', 'teams']);
  if (!allowedTypes.has(type)) {
    return res.status(400).json({ error: 'Invalid type. Use matches, standings, or teams.' });
  }

  const endpointMap = {
    matches: `/competitions/WC/matches?season=${encodeURIComponent(season)}`,
    standings: `/competitions/WC/standings?season=${encodeURIComponent(season)}`,
    teams: `/competitions/WC/teams?season=${encodeURIComponent(season)}`
  };

  try {
    const upstream = await fetch(`${API_BASE}${endpointMap[type]}`, {
      headers: { 'X-Auth-Token': token }
    });

    const text = await upstream.text();
    res.setHeader('Cache-Control', type === 'matches'
      ? 's-maxage=60, stale-while-revalidate=300'
      : 's-maxage=300, stale-while-revalidate=900');
    res.setHeader('Content-Type', 'application/json');
    return res.status(upstream.status).send(text);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch football data.' });
  }
};
