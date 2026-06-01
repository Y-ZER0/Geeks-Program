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

    // ═══════════════════════════════════════════════════════════════════════
    // FETCH CURRENT PLAYER STATE
    // ═══════════════════════════════════════════════════════════════════════
    const getRes = await fetch(
      `https://odgjus12.api.sanity.io/v2024-01/data/query/production?query=*[_id=="${docId}"][0]{scoreHistory, scoreW2, scoreMo, live}`,
      {
        headers: {
          Authorization: `Bearer ${env.SANITY_TOKEN}`,
        },
      }
    );
    const getData = await getRes.json();
    const currentPlayer = getData?.result || {};
    const scoreHistory = currentPlayer.scoreHistory || [];
    const scoreW2 = currentPlayer.scoreW2 || [];
    const scoreMo = currentPlayer.scoreMo || [];
    const oldLive = currentPlayer.live || { ai: 0, cyber: 0, web: 0 };

    // ═══════════════════════════════════════════════════════════════════════
    // CALCULATE DELTAS
    // ═══════════════════════════════════════════════════════════════════════
    const lastEntry = scoreHistory[scoreHistory.length - 1] || {};
    const hasHistory = scoreHistory.length > 0;
    const ai = hasHistory ? newAi - (lastEntry.ai ?? 0) : newAi;
    const cyber = hasHistory ? newCyber - (lastEntry.cyber ?? 0) : newCyber;
    const web = hasHistory ? newWeb - (lastEntry.web ?? 0) : newWeb;

    const now = new Date();
    const timestamp = now.toISOString();
    const _key = now.getTime().toString(36);

    // ═══════════════════════════════════════════════════════════════════════
    // DETECT PERIOD BOUNDARIES (2-WEEK)
    // ═══════════════════════════════════════════════════════════════════════
    const EPOCH_W2 = new Date('2026-01-05T00:00:00Z');
    const MS_PER_14_DAYS = 14 * 24 * 60 * 60 * 1000;
    const msSinceEpoch = now - EPOCH_W2;
    const currentW2Period = Math.floor(msSinceEpoch / MS_PER_14_DAYS);
    const lastW2Entry = scoreW2[scoreW2.length - 1];
    const lastW2Period = lastW2Entry?.periodId ?? -1;
    const w2PeriodChanged = lastW2Period !== currentW2Period;

    // ═══════════════════════════════════════════════════════════════════════
    // DETECT PERIOD BOUNDARIES (MONTHLY)
    // ═══════════════════════════════════════════════════════════════════════
    const currentMonthYear = now.toISOString().slice(0, 7); // "2026-06"
    const lastMoEntry = scoreMo[scoreMo.length - 1];
    const lastMonthYear = lastMoEntry?.monthYear ?? '';
    const monthPeriodChanged = lastMonthYear !== currentMonthYear;

    // ═══════════════════════════════════════════════════════════════════════
    // BUILD MUTATIONS FOR ARRAYS
    // ═══════════════════════════════════════════════════════════════════════
    const newHistoryEntry = { _key, ai, cyber, web, timestamp };
    let newW2Entry = null;
    let newMoEntry = null;

    if (w2PeriodChanged && scoreW2.length > 0) {
      newW2Entry = { _key: `${_key}-w2`, ai, cyber, web, timestamp, periodId: currentW2Period };
    } else if (scoreW2.length === 0) {
      newW2Entry = { _key: `${_key}-w2`, ai, cyber, web, timestamp, periodId: currentW2Period };
    }

    if (monthPeriodChanged && scoreMo.length > 0) {
      newMoEntry = { _key: `${_key}-mo`, ai, cyber, web, timestamp, monthYear: currentMonthYear };
    } else if (scoreMo.length === 0) {
      newMoEntry = { _key: `${_key}-mo`, ai, cyber, web, timestamp, monthYear: currentMonthYear };
    }

    // Build patch mutations for all three arrays
    const mutations = [];

    mutations.push({
      patch: {
        id: docId,
        insert: {
          after: 'scoreHistory[-1]',
          items: [newHistoryEntry],
        },
      },
    });

    if (newW2Entry) {
      mutations.push({
        patch: {
          id: docId,
          insert: {
            after: 'scoreW2[-1]',
            items: [newW2Entry],
          },
        },
      });
    } else if (scoreW2.length > 0) {
      // If period hasn't changed, increment the last entry
      mutations.push({
        patch: {
          id: docId,
          set: {
            [`scoreW2[_key=="${lastW2Entry._key}"].ai`]: (lastW2Entry.ai ?? 0) + ai,
            [`scoreW2[_key=="${lastW2Entry._key}"].cyber`]: (lastW2Entry.cyber ?? 0) + cyber,
            [`scoreW2[_key=="${lastW2Entry._key}"].web`]: (lastW2Entry.web ?? 0) + web,
          },
        },
      });
    }

    if (newMoEntry) {
      mutations.push({
        patch: {
          id: docId,
          insert: {
            after: 'scoreMo[-1]',
            items: [newMoEntry],
          },
        },
      });
    } else if (scoreMo.length > 0) {
      // If period hasn't changed, increment the last entry
      mutations.push({
        patch: {
          id: docId,
          set: {
            [`scoreMo[_key=="${lastMoEntry._key}"].ai`]: (lastMoEntry.ai ?? 0) + ai,
            [`scoreMo[_key=="${lastMoEntry._key}"].cyber`]: (lastMoEntry.cyber ?? 0) + cyber,
            [`scoreMo[_key=="${lastMoEntry._key}"].web`]: (lastMoEntry.web ?? 0) + web,
          },
        },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SEND MUTATIONS TO SANITY
    // ═══════════════════════════════════════════════════════════════════════
    const mutation = { mutations };

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
