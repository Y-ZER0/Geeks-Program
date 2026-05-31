export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') return new Response('OK');

    const payload = await request.json();
    const doc = payload.body || payload;

    if (doc._type !== 'player') return new Response('Ignored');

    const docId = (doc._id || '').replace(/^drafts\./, '');
    if (!docId) return new Response('No ID');

    const newAi = doc.live?.ai ?? 0;
    const newCyber = doc.live?.cyber ?? 0;
    const newWeb = doc.live?.web ?? 0;

    // Fetch current player to get last scoreHistory entry
    const getRes = await fetch(
      `https://odgjus12.api.sanity.io/v2024-01/data/query/production?query=*[_id=="${docId}"][0]{scoreHistory}`,
      {
        headers: {
          Authorization: `Bearer ${env.SANITY_TOKEN}`,
        },
      }
    );
    const getData = await getRes.json();
    const scoreHistory = getData?.result?.scoreHistory || [];
    const lastEntry = scoreHistory[scoreHistory.length - 1] || {};

    // First entry ever: store 0 as baseline
    // Subsequent entries: delta from the last recorded values
    const hasHistory = scoreHistory.length > 0;
    const ai = hasHistory ? newAi - (lastEntry.ai ?? 0) : 0;
    const cyber = hasHistory ? newCyber - (lastEntry.cyber ?? 0) : 0;
    const web = hasHistory ? newWeb - (lastEntry.web ?? 0) : 0;

    const mutation = {
      mutations: [
        {
          patch: {
            id: docId,
            insert: {
              after: 'scoreHistory[-1]',
              items: [
                {
                  _key: Date.now().toString(36),
                  ai,
                  cyber,
                  web,
                  timestamp: new Date().toISOString(),
                },
              ],
            },
          },
        },
      ],
    };

    await fetch(
      `https://odgjus12.api.sanity.io/v2024-01/data/mutate/production`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.SANITY_TOKEN}`,
        },
        body: JSON.stringify(mutation),
      }
    );

    return new Response('OK');
  },
};
