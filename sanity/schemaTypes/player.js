/**
 * Geeks Program – Player schema (Sanity v3)
 *
 * Add to your studio's schemaTypes/index.js:
 *   import player from './player'
 *   export const schemaTypes = [player]
 *
 * Tier badges and tier colors are AUTO-DERIVED from points on the frontend.
 * Initials and avatar colors are also AUTO-DERIVED on the frontend.
 * You only manage name, tasks, and points here. Tier ranges:
 *   Bronze 0-74 | Silver 75-149 | Gold 150-299
 *   Platinum 300-599 | Geek 600-899 | Geeks Master 900+
 */

export default {
  name:  'player',
  title: 'Player',
  type:  'document',

  groups: [
    { name: 'profile',   title: 'Profile',     default: true },
    { name: 'live',      title: '⚡ Live'                    },
  ],

  fields: [
    /* ─── Profile ─── */
    {
      name:  'name',
      title: 'Name',
      type:  'string',
      group: 'profile',
      description: 'Full name (e.g., "John Doe"). Used to auto-extract initials on frontend.',
      validation: R => R.required().max(50),
    },
    {
      name:  'tasksCompleted',
      title: 'Tasks Completed',
      type:  'number',
      group: 'profile',
      description: 'Number of tasks completed (manually set).',
      initialValue: 0,
      validation: R => R.required().min(0).integer(),
    },

    /* ─── Live ─── */
    {
      name:    'live',
      title:   'Live Score',
      type:    'object',
      group:   'live',
      options: { columns: 3 },
      fields:  [
        { name: 'ai',    title: 'AI Points',            type: 'number', initialValue: 0, validation: R => R.required().min(0).integer() },
        { name: 'cyber', title: 'Cybersecurity Points', type: 'number', initialValue: 0, validation: R => R.required().min(0).integer() },
        { name: 'web',   title: 'Web Dev Points',       type: 'number', initialValue: 0, validation: R => R.required().min(0).integer() },
      ],
    },


  ],

  /* Studio list preview: shows name + live total + auto-computed tier */
  preview: {
    select: {
      name: 'name',
      lAI: 'live.ai',
      lCy: 'live.cyber',
      lWb: 'live.web',
    },
    prepare({ name, lAI = 0, lCy = 0, lWb = 0 }) {
      const total = lAI + lCy + lWb;
      const tier  =
        total >= 900 ? 'Geeks Master 🏆' :
        total >= 600 ? 'Geek ⚡'         :
        total >= 300 ? 'Platinum 💎'     :
        total >= 150 ? 'Gold 🥇'         :
        total >= 75  ? 'Silver 🥈'       :
                       'Bronze 🥉';
      return {
        title:    name || 'Unnamed',
        subtitle: `Live total: ${total} pts · ${tier}`,
      };
    },
  },
};
