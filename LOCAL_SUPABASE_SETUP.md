Local Supabase + Node.js deployment guide

This guide helps you run Supabase locally and configure this project (`JobApplyManagement`) to use the local Supabase instance.

1) Install Supabase CLI

- macOS / Linux (using npm):
  npm install -g supabase

- See https://supabase.com/docs/guides/cli for alternative install options.

2) Initialize and start local Supabase

- From the project root (where `package.json` sits):
  supabase init
  supabase start

- The CLI will create a `.supabase` folder and start Postgres, realtime, and storage services. The output shows connection URL and anon/service keys. Keep that terminal open while developing.

3) Copy environment values

- After `supabase start`, CLI prints important vars like `anon` and `service_role` keys and the local URL (usually http://localhost:54321).
- Create a `.env` at project root (not checked into git) using `.env.example` as template and paste the values:

  VITE_SUPABASE_URL=http://localhost:54321
  VITE_SUPABASE_ANON_KEY=<anon-key-from-cli>

  # Optional for server side
  SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

4) Run the frontend dev server

- Install dependencies if you haven't:
  npm install

- Start dev server (Vite):
  npm run dev

- The client will pick up `VITE_SUPABASE_*` variables automatically.

5) Running migrations / restoring schema

- If you have a SQL dump, apply it to the local DB:
  supabase db remote set <remote-connection-string>
  supabase db restore <dump-file>

- Or use `supabase db push` if using migrations.

6) Deploying Node.js (production)

- For production, you typically run a Node server and use Supabase hosted service or self-hosted Supabase.
- Set NODE env vars on the server (e.g., on systemd / Docker / cloud provider):
  VITE_SUPABASE_URL=https://<your-supabase-host>
  VITE_SUPABASE_ANON_KEY=<anon>
  SUPABASE_SERVICE_ROLE_KEY=<service-role>

- If building the frontend for production:
  npm run build
  npm run preview # or serve the `dist` files with a static server

7) Notes and tips

- Keep service role keys secret; only use anon keys in browser apps.
- If you run into CORS or WebSocket issues, ensure the CLI output URL and ports match the values in `.env`.
- If you prefer Docker-only flow, use the Supabase Docker images per the Supabase docs.

That's it — your app will use the local Supabase when `VITE_SUPABASE_URL` points at your local instance. If you want, I can add a `supabase` npm script and a small health-check script next.
