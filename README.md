# Geeks Program Leaderboard

A real-time leaderboard application showcasing top performers in the Geeks Program, powered by Sanity CMS and React.

## Features

- 🏆 **Real-time Leaderboard** — Live ranking with auto-refresh (60s intervals)
- 📊 **Multiple Timeframes** — View scores for Live, 2-Week, and Monthly periods
- 🎯 **Category Filtering** — Track progress across AI, Cybersecurity, and Web Dev
- 🥇 **Tier System** — 6-tier progression from Bronze to Geeks Master
- 🎨 **Beautiful UI** — Dark-themed design with animated podium and progress indicators
- ⚡ **Smooth Animations** — Shimmer effects, tier transitions, and hover interactions
- 📱 **Responsive** — Works on desktop, tablet, and mobile devices

## Quick Start

### Prerequisites

- Node.js 16+
- A Sanity project (get one free at [sanity.io](https://sanity.io))

### Installation

```bash
# 1. Clone or download this project
cd geeks-program

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# Then edit .env.local with your Sanity credentials:
# VITE_SANITY_PROJECT_ID=your_project_id
# VITE_SANITY_DATASET=production
# VITE_SANITY_API_VERSION=2024-01-01
```

### Find Your Sanity Credentials

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project and go to **Settings**
3. Copy your **Project ID**
4. Add your domain to **API → CORS Origins**

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:3000` with hot reload enabled.

### Build for Production

```bash
npm run build
```

Creates optimized bundle in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
geeks-program/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── GeeksLeaderboard.jsx    # Main leaderboard component
│   │   ├── Avatar.jsx              # Player avatar display
│   │   ├── TierBadge.jsx           # Tier badge component
│   │   ├── HoverTooltip.jsx        # Progress tooltip on hover
│   │   ├── SkeletonRow.jsx         # Loading skeleton
│   │   └── SetupGuide.jsx          # Setup instructions
│   ├── hooks/
│   │   └── usePlayers.js           # Data fetching hook with auto-refresh
│   ├── utils/
│   │   ├── tiers.js                # Tier definitions and logic
│   │   ├── scoring.js              # Score calculations
│   │   └── format.js               # Formatting utilities
│   ├── config/
│   │   └── sanity.js               # Sanity client configuration
│   ├── App.jsx                     # App wrapper
│   └── main.jsx                    # React entry point
├── public/                          # Static assets
├── sanity/
│   └── schemaTypes/
│       └── player.js               # Sanity player schema
├── index.html                       # HTML template
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies
├── .env.example                    # Environment template
└── README.md                       # This file
```

## Data Model

### Player Document (Sanity)

```javascript
{
  _id: "player-123",
  name: { current: "geek_prime" },
  displayName: "Ahmad Al-Khalil",
  initials: "AK",
  avatarColor: "#1C75BC",
  live: { ai: 150, cyber: 200, web: 100 },
  twoWeeks: { ai: 120, cyber: 180, web: 90 },
  monthly: { ai: 100, cyber: 150, web: 80 }
}
```

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Build Tool**: Vite
- **CMS**: Sanity (headless)
- **UI Icons**: lucide-react
- **Styling**: CSS-in-JS (inline styles)
- **API**: Sanity GROQ queries

## Customization

### Change Tier Ranges

Edit `src/utils/tiers.js`:

```javascript
export const TIERS = [
  { min: 900, name: "Geeks Master", color: "#FFD883", ... },
  // Update min values to change tier thresholds
];
```

### Adjust Auto-Refresh Interval

In `src/components/GeeksLeaderboard.jsx`:

```javascript
const { players, loading, error, ... } = usePlayers(
  tf === "live" ? 60_000 : null  // Change 60_000 (60s) to desired milliseconds
);
```

### Modify Styling

The leaderboard uses inline styles. Core colors are defined in `src/utils/tiers.js` and can be easily customized.

## Deployment

The built `dist/` folder is ready to deploy to any static host:

- **Vercel**: `npm run build` → Push to GitHub → Auto-deploy
- **Netlify**: Drag-and-drop `dist/` folder
- **GitHub Pages**: Push `dist/` to `gh-pages` branch

## Environment Variables

See `.env.example` for all available options:

| Variable                  | Required | Default      | Description            |
| ------------------------- | -------- | ------------ | ---------------------- |
| `VITE_SANITY_PROJECT_ID`  | Yes      | —            | Your Sanity project ID |
| `VITE_SANITY_DATASET`     | No       | `production` | Sanity dataset name    |
| `VITE_SANITY_API_VERSION` | No       | `2024-01-01` | Sanity API version     |

## Troubleshooting

### "Sanity API responded with 403"

- Check your **Project ID** is correct
- Verify your domain is added to **CORS Origins** in Sanity settings

### "No players found"

- Add player documents to your Sanity project
- Ensure the schema is correctly imported in Sanity Studio

### Development server won't start

- Delete `node_modules/` and `package-lock.json`, then run `npm install`
- Ensure Node.js 16+ is installed

## Contributing

To improve the leaderboard:

1. Fork or clone the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "Add my feature"`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

MIT © Geeks Program

## Support

For issues or questions:

- Check [Sanity Docs](https://www.sanity.io/docs)
- See [Vite Documentation](https://vitejs.dev)
- Review [React Hooks Guide](https://react.dev/reference/react)

---

**Made with ❤️ for the Geeks Program at University of Jordan**
