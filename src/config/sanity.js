/**
 * Sanity CMS Configuration
 * 
 * Fill in your project ID and dataset before deployment:
 * 1. Project ID → sanity.io/manage → your project → Settings
 * 2. Dataset   → usually "production"
 * 3. CORS      → Settings → API → CORS Origins → add your domain
 */
 
const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID || "xxxxxxxxxxxx";
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET || "production";
const SANITY_API_VER = import.meta.env.VITE_SANITY_API_VERSION || "2024-01-01";

/**
 * GROQ Query for fetching all players with their scores
 */
const GROQ = encodeURIComponent(`
  *[_type == "player"] | order(name asc) {
    "id":  _id,
    "name": name,
    "live": {
      "AI": coalesce(live.ai,    0),
      "Cy": coalesce(live.cyber, 0),
      "Wb": coalesce(live.web,   0)
    },
    "scoreHistory": coalesce(scoreHistory[], [])
  }
`);

/**
 * Build Sanity API URL
 */
const buildSanityUrl = () => {
  return `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VER}/data/query/${SANITY_DATASET}?query=${GROQ}`;
};

/**
 * Check if Sanity is configured
 */
const isConfigured = () => SANITY_PROJECT_ID !== "xxxxxxxxxxxx";

export {
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_API_VER,
  GROQ,
  buildSanityUrl,
  isConfigured,
};
