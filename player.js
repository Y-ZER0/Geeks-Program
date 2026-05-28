/**
 * Geeks Program – Player schema (Sanity v3)
 *
 * Add to your studio's schemaTypes/index.js:
 *   import player from './player'
 *   export const schemaTypes = [player]
 *
 * Tier badges and tier colors are AUTO-DERIVED from points on the frontend.
 * You only manage points here. Ranges:
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
    { name: 'twoWeeks',  title: '📅 2 Weeks'               },
    { name: 'monthly',   title: '🗓 Monthly'                },
  ],

  fields: [
    /* ─── Profile ─── */
    {
      name:  'name',
      title: 'Username',
      type:  'slug',
      group: 'profile',
      options: { source: 'name', maxLength: 30 },
      description: 'Handle shown on the leaderboard (e.g. geek_prime). Use lowercase with underscores.',
      validation: R => R.required(),
    },
    {
      name:  'displayName',
      title: 'Display Name',
      type:  'string',
      group: 'profile',
      description: 'Full name or preferred display name (e.g. Ahmad Al-Khalil)',
      validation: R => R.required().max(40),
    },
    {
      name:  'initials',
      title: 'Initials',
      type:  'string',
      group: 'profile',
      description: '1–2 uppercase chars shown inside the avatar circle (e.g. AK)',
      validation: R => R.required().max(2),
    },
    {
      name:  'avatarColor',
      title: 'Avatar Color',
      type:  'string',
      group: 'profile',
      description:
        'Hex code for the avatar ring & label. Tier badge color is auto-computed from points — do not enter it here. Example: #1C75BC',
      validation: R =>
        R.required().regex(/^#[0-9A-Fa-f]{6}$/, {
          name:   'hex color',
          invert: false,
        }),
      /* Tip: install @sanity/color-input and change type to 'color' for a color picker */
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

    /* ─── 2-Week ─── */
    {
      name:    'twoWeeks',
      title:   '2-Week Score',
      type:    'object',
      group:   'twoWeeks',
      options: { columns: 3 },
      fields:  [
        { name: 'ai',    title: 'AI Points',            type: 'number', initialValue: 0, validation: R => R.required().min(0).integer() },
        { name: 'cyber', title: 'Cybersecurity Points', type: 'number', initialValue: 0, validation: R => R.required().min(0).integer() },
        { name: 'web',   title: 'Web Dev Points',       type: 'number', initialValue: 0, validation: R => R.required().min(0).integer() },
      ],
    },

    /* ─── Monthly ─── */
    {
      name:    'monthly',
      title:   'Monthly Score',
      type:    'object',
      group:   'monthly',
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
      slug: 'name',
      display: 'displayName',
      lAI: 'live.ai',
      lCy: 'live.cyber',
      lWb: 'live.web',
    },
    prepare({ slug, display, lAI = 0, lCy = 0, lWb = 0 }) {
      const total = lAI + lCy + lWb;
      const tier  =
        total >= 900 ? 'Geeks Master 🏆' :
        total >= 600 ? 'Geek ⚡'         :
        total >= 300 ? 'Platinum 💎'     :
        total >= 150 ? 'Gold 🥇'         :
        total >= 75  ? 'Silver 🥈'       :
                       'Bronze 🥉';
      return {
        title:    display || (slug?.current ?? 'Unnamed'),
        subtitle: `Live total: ${total} pts · ${tier}`,
      };
    },
  },
};