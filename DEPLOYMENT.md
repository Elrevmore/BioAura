# BioAura Deployment Guide

Production deployment checklist for the BioAura holographic protein viewer.

---

## Requirements

| Requirement | Reason |
|---|---|
| **HTTPS** | `getUserMedia` (webcam) only works on secure origins (`https://` or `localhost`) |
| **Modern browser** | Chrome 120+, Firefox 120+, Safari 17+ with WebGL2 |
| **Camera permission** | User must grant webcam access |
| **Outbound network** | Fetches PDB from RCSB + MediaPipe WASM from CDN |

---

## Quick Deploy Options

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Configuration is in `vercel.json` — SPA rewrites, security headers, and asset caching are pre-configured.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist --build
```

Or connect the GitHub repo — `netlify.toml` handles build settings automatically.

### Docker

```bash
# Build
npm run docker:build

# Run locally on http://localhost:8080
npm run docker:run
```

For production HTTPS, place the container behind a TLS-terminating reverse proxy (Caddy, Traefik, or cloud load balancer).

```bash
docker build -t bioaura:latest .
docker run -d -p 8080:80 --name bioaura bioaura:latest
```

Health check endpoint: `GET /health`

### Static hosting (any CDN)

```bash
npm ci
npm run build
# Upload contents of dist/ to your static host
```

Ensure SPA fallback: all routes must serve `index.html`.

---

## Environment Variables

Copy `.env.production.example` to `.env.production` for custom values:

| Variable | Default | Description |
|---|---|---|
| `VITE_BASE_PATH` | `/` | Base URL path (use `/repo-name/` for GitHub Pages) |
| `VITE_SOURCEMAP` | `false` | Enable source maps in production builds |
| `VITE_MEDIAPIPE_WASM` | jsDelivr CDN | MediaPipe WASM asset path |
| `VITE_MEDIAPIPE_HAND_MODEL` | Google CDN | Hand landmarker model URL |

---

## GitHub Pages (subpath deploy)

```bash
# .env.production
VITE_BASE_PATH=/BioAura/
```

```bash
npm run build
# Deploy dist/ to gh-pages branch
```

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`
5. Uploads `dist/` as artifact

Run locally:

```bash
npm run ci
```

---

## Production Build Verification

```bash
npm run preview:prod
```

Open `https://localhost:4173` is NOT secure — use:

```bash
npx vite preview --host
```

For HTTPS preview testing, use a tunnel:

```bash
npx localtunnel --port 4173
```

Verify:
- [ ] 3D scene renders (hemoglobin loads from RCSB)
- [ ] Camera permission prompt appears
- [ ] Hand tracking skeleton overlays on camera feed
- [ ] Gestures move/rotate/scale the protein
- [ ] No console errors in production build

---

## Security Headers

All deployment configs include:

```
Permissions-Policy: camera=(self)
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Camera not working | Ensure HTTPS; check browser permissions |
| MediaPipe fails to load | Verify CDN access; check `VITE_MEDIAPIPE_*` overrides |
| Protein won't load | RCSB API must be reachable; check network/CORS |
| Blank page after deploy | Verify SPA fallback and `VITE_BASE_PATH` |
| WebGL errors | GPU/drivers; try disabling hardware acceleration |

---

## Node.js Version

Use Node.js 22 (see `.nvmrc`):

```bash
nvm use
```
