# Deploy WARFRONT

## Vercel client

1. Import https://github.com/carynyx80/warfront into Vercel.
2. Use repository root (`./`) and Framework Preset **Other**. Node.js **24.x** is declared in package.json.
3. Keep the settings from vercel.json: install `npx --yes pnpm@10.28.0 install --frozen-lockfile --ignore-scripts`, build `node scripts/build.js`, output `dist`.
4. Optionally set `WARFRONT_SERVER_URL=wss://your-game-server.example` before deploying. This is a public client configuration value; do not put secrets in it. The build rejects insecure ws:// endpoints on Vercel, credentials, query parameters, and fragments. If omitted, the lobby accepts a manually entered server URL; online combat remains unavailable until a server is configured.
5. Deploy. Test `/`, `/lobby`, `/loadout`, `/play`, and direct refreshes. JavaScript, JSON, and engine assets are served as files. Unknown paths return 404. `/dev` redirects home in Vercel production/preview deployments, so the local development dashboard is not exposed there.

The repository does not need a checked-in engine bundle: `pnpm build` copies PlayCanvas and its license from the pinned dependency. No Site credentials or generated .openai identity are uploaded. Native canvas scripts are disabled because only the browser engine is used.

## Persistent game server

Vercel hosts the static browser client. This project requires its separate Node/WebSocket process for live multiplayer; deploying the client does not deploy the game server.

Build from repository root:

```sh
docker build -f infrastructure/Dockerfile -t warfront .
docker run --rm -p 3000:3000 --env-file .env warfront
```

Copy .env.example to .env. Set `ALLOWED_ORIGIN` to the exact Vercel client origin and `DEV_TOKEN` to a long random secret. Deploy the container on a host supporting long-lived WebSocket connections, expose it through TLS, and set the Vercel client build variable to its wss:// address. Redeploy the client after changing this variable. Set allowed origins separately for preview deployments if testing those; the current server allows one configured origin. The browser's manually saved server URL overrides the build setting and can be cleared in the lobby.

One server instance supports one in-memory room; do not horizontally scale it as if it shared state. There is no durable persistence or automatic recovery. External container hosting, TLS provisioning, and a Vercel project have not been created by this repository upload. Docker/Vercel infrastructure deployment is not claimed as verified.

## Local verification

```sh
corepack enable
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm test
pnpm dev
```

Open http://localhost:3000/dev. Source changes to the client require refresh; server changes require restart. The local Node server enforces a production `/dev` authorization header, separately from Vercel's redirect. Keep secrets in the deployment environment and never commit .env.

Production alpha still needs authentication, persistent statistics, robust room recovery, load/security testing, and polished assets. See IMPLEMENTATION_STATUS.md.
