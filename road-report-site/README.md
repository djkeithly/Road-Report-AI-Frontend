# Road Report Site Code

This is the website code for the Road Report AI project

## Developed With

- Vue.js
- TypeScript
- Vite
- Tailwind CSS
- More to be added once design is finalized

## Structure

More to be added once visual design is finalized

```
├── src/
│   ├── assets/            # Global styles and static images
│   ├── router/            # Vue Router configuration
│   ├── components/        # Reusable/specialized page entries (think the map display)
│   ├── views/             # Main page components (routes)
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
