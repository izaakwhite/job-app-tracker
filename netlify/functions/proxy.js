exports.handler = async (event) => {
  const { sheetId } = event.queryStringParameters || {};

  if (!sheetId || !/^[a-zA-Z0-9_-]+$/.test(sheetId)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or missing sheetId' }) };
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

  try {
    const res  = await fetch(csvUrl, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();

    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Sheet is private — Google blocked access.',
          hint: 'In Google Sheets: Share → Change → Anyone with the link → Viewer',
        }),
      };
    }

    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: `HTTP ${res.status}` }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: text,
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
