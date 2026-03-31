# Road Report Site Code

This is the website code for the Road Report AI project

## Developed With

- Vue.js
- TypeScript
- Vite
- Tailwind CSS
- Maplibre-GL
- OpenStreetMap
- More to be added once design is finalized

## Structure

More to be added once visual design is finalized

```
├── src/
│   ├── assets/            # Global styles and static images
│   │   └── styles/        # CSS styling files
│   ├── router/            # Vue Router configuration
│   ├── components/        # Reusable/specialized page entries (think the map display)
│   │   └── layout/        # Page-agnostic components (headers/footers)
│   ├── composables/       # Reusable typescript state functions
│   ├── views/             # Main page components (routes)
│   ├── types/             # Type definitions for the project
│   ├── App.vue            # Root component
│   └── main.ts            # App entry point & plugin registration
├── index.html             # Entry HTML file
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript compiler options
└── vite.config.ts         # Vite build configuration
```

## Other Details

More to be added once visual design is finalized

Router is configured such that anything that isn't a specific page redirects to `/`  
Title bar doesn't automatically change with router, though we'll want to pull in info so that it does  
Bounds are passed as queries from the router to the maps  
Try not to over-submit so we don't get timed out

## Backend Integration

Create a `.env` file in this folder when running against the backend:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

The report page expects geocoded `q`, `lat`, and `lng` query params and calls `POST /api/v1/risk/predict`.
