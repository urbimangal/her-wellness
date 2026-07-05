# HerWellness — Frontend (React + Tailwind CSS)

Health & wellness landing page for women, built with **React 18**, **Vite**, and **Tailwind CSS**.
Recreates the HerWellness reference design: hero, key features, AI health assistant,
emergency services, system flow, personalized dashboard, analytics, community, mission,
tech stack, and footer.

## Folder Structure

```
her-wellness/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    └── components/
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── Features.jsx
        ├── AIAssistant.jsx
        ├── EmergencyAndFlow.jsx        (Emergency Services + System Flow + Dashboard)
        ├── AnalyticsAndCommunity.jsx   (AI Analytics + Women's Community)
        ├── MissionAndStack.jsx         (Our Mission + Tech Stack)
        └── Footer.jsx
```

## Getting Started

1. Extract this zip and open a terminal in the `her-wellness` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open the printed local URL (usually http://localhost:5173) in your browser.
4. Build for production:
   ```bash
   npm run build
   ```
   Output goes to the `dist/` folder — deploy it anywhere (Vercel, Netlify, etc.).

## Notes

- Icons: [lucide-react](https://lucide.dev/)
- Fonts: Poppins (display) + Inter (body), loaded from Google Fonts in `index.html`
- Colors and theme tokens live in `tailwind.config.js` under `theme.extend.colors.brand`
- All illustrations/charts are hand-built with SVG/CSS — no external image assets needed
- Fully responsive: mobile menu, stacked grids on small screens

## Customize

- Replace the SVG hero illustration in `Hero.jsx` with a real image if you have one.
- Update copy, links, and social icons in `Footer.jsx`.
- Wire up the buttons (Get Started, Sign Up, Trigger SOS Now, etc.) to real routes/APIs.
