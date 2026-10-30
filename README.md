# Claude Usage Dashboard

Web dashboard for `claude-usage-server`: team overview, per-person usage, sessions, models and
user/API key administration.

## Run it

The whole stack (Postgres, API, dashboard) runs from `claude-usage-server`:

```sh
cd ../claude-usage-server
docker compose up -d --build --wait
```

Then open http://localhost:3000 and sign in with the seeded admin (`SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` in the server's `.env`).

## Develop

Node >= 22.12 and yarn 1.22.22. `VITE_SERVER_URL` (in `.env` for dev, the `VITE_SERVER_URL` build arg for Docker, default `http://localhost:8080`) points at the API,
default `http://localhost:8080`; Vite inlines it at build time.

```sh
yarn install
yarn dev          # http://localhost:5173
yarn typecheck
yarn test
yarn lint
yarn build
```

Views: `/dashboard/overview` (admin), `/dashboard/person`, `/dashboard/sessions`,
`/dashboard/models`, `/dashboard/admin/people` (admin).
