# ETHSL Learner LMS

React + Vite SPA frontend for the ETHSL Django LMS API.

## Stack
- React 18 (JavaScript)
- Vite 5
- React Router DOM 6
- Axios (JWT interceptor)
- Tailwind CSS

## Getting started
```bash
npm install
cp .env.example .env       # adjust VITE_API_BASE_URL if needed
npm run dev
```

## Build
```bash
npm run build      # outputs dist/
npm run preview
```

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. Framework: **Vite**. Build: `npm run build`. Output: `dist`.
4. Set env var `VITE_API_BASE_URL` (defaults to the Render URL).
5. `vercel.json` already provides SPA fallback so refreshes don't 404.

## API
Base URL: `https://ethsl-system.onrender.com/api`
JWT access token is stored in `localStorage` and attached to every request via an Axios interceptor. 401 responses auto-logout.

## Routes
`/` `/login` `/register` `/placement` `/levels` `/courses/:levelId` `/lessons/:courseId` `/lesson/:id` `/quiz/:id` `/profile`

> Endpoint paths in `src/api/*.js` follow common DRF conventions (`/auth/login/`, `/levels/`, `/courses/?level=`, `/lessons/?course=`, `/quizzes/:id/`, `/profile/`, etc.). Adjust them to match your Django URLs if they differ.
