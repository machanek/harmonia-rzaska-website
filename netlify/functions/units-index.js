'use strict';

const REPO      = process.env.UNITS_REPO   || 'machanek/harmonia-rzaska-website';
const BRANCH    = process.env.UNITS_BRANCH || 'main';
const UNITS_DIR = process.env.UNITS_DIR    || 'data/units';

exports.handler = async () => {
  try {
    const url = `https://api.github.com/repos/${REPO}/contents/${UNITS_DIR}?ref=${BRANCH}`;
    const headers = { 'User-Agent': 'units-index' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const listRes = await fetch(url, { headers });
    if (!listRes.ok) {
      return { statusCode: listRes.status, body: await listRes.text() };
    }

    const files = (await listRes.json()).filter(f => f.name.endsWith('.json'));
    const units = [];
    for (const f of files) {
      const r = await fetch(f.download_url, { headers: { 'User-Agent': 'units-index' } });
      if (!r.ok) continue;
      try {
        const obj = await r.json();
        obj.__file = f.name; // pomocne w debug
        units.push(obj);
      } catch (_) {}
    }

    const norm = v => String(v ?? '').toLowerCase();
    units.sort((a, b) => {
      const ax = norm(a.id || a.slug), bx = norm(b.id || b.slug);
      const an = parseFloat(ax.replace(/[^\d.]/g, ''));
      const bn = parseFloat(bx.replace(/[^\d.]/g, ''));
      if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn) return an - bn;
      return ax.localeCompare(bx, 'pl');
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ units })
    };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};
