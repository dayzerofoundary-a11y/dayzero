# DayZeroFoundry - Single-page MVP Web Product

We are creating a platform for innovative thinkers to become future entrepreneurs. This is a single-page MVP web product codebase.

The original project design is available at:
https://www.figma.com/design/Xbzhwli47LfUzwYxDmc9rQ/Single-page-MVP-web-product

## Running the Code

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

   This starts both the Vite frontend and the intake API. The frontend runs at
   `http://127.0.0.1:5173` and proxies `/api` to the backend on port `4000`.

## Environment

Create `.env.local` in the project root when you need local frontend settings:

```bash
VITE_ADMIN_PASSWORD=change-this-password
```

Backend settings live in `files/.env`; start from `files/.env.example`.
