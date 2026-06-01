export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') return new Response('OK');

    const payload = await request.json();
    const doc = payload.body || payload;

    if (doc._type !== 'player') return new Response('Ignored');

    const docId = (doc._id || '').replace(/^drafts\./, '');
    if (!docId) return new Response('No ID');

    // ═══════════════════════════════════════════════════════════════════════
    // FETCH CURRENT PLAYER STATE
    // ═══════════════════════════════════════════════════════════════════════
    const getRes = await fetch(
      `https://odgjus12.api.sanity.io/v2024-01/data/query/production?query=*[_id=="${docId}"][0]{scoreHistory, live}`,
      {
        headers: {
          Authorization: `Bearer ${env.SANITY_TOKEN}`,
        },
      }
    );
    const getData = await getRes.json();
    const player = getData?.result || {};
    const oldLive = player.live || { ai: 0, cyber: 0, web: 0 };

    // ═══════════════════════════════════════════════════════════════════════
    // CALCULATE DELTAS
    // ═══════════════════════════════════════════════════════════════════════
    const newAi = doc.live?.ai ?? 0;
    const newCyber = doc.live?.cyber ?? 0;
    const newWeb = doc.live?.web ?? 0;

    const delta = {
      _key: Date.now().toString(36),
      ai: newAi - (oldLive.ai ?? 0),
      cyber: newCyber - (oldLive.cyber ?? 0),
      web: newWeb - (oldLive.web ?? 0),
      timestamp: new Date().toISOString(),
    };

    // ═══════════════════════════════════════════════════════════════════════
    // APPEND TO SCORE HISTORY
    // ═══════════════════════════════════════════════════════════════════════
    const mutation = {
      mutations: [
        {
          patch: {
            id: docId,
            insert: {
              after: 'scoreHistory[-1]',
              items: [delta],
            },
          },
        },
      ],
    };

    const mutateRes = await fetch(
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

    const mutateData = await mutateRes.json();
    if (mutateData.error) {
      console.error('Mutation error:', mutateData.error);
      return new Response(`Error: ${mutateData.error.message}`, { status: 400 });
    }

    return new Response('OK');
  },
};
