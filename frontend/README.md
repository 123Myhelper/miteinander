# MyHelper frontend

The Next.js web app for [www.myhelper.me](https://www.myhelper.me). It talks to the Express API in `../backend`.

## Local development

```bash
npm install
npm start
```

`npm start` runs the development server on [http://localhost:1003](http://localhost:1003).

The API address comes from `NEXT_PUBLIC_API_URL` in `.env.local`. Next.js bakes it into the build, so a change needs a restart (or a rebuild for production).

Other scripts:

- `npm run build`: production build
- `npm run lint`: ESLint

## Deployment

Production runs on our own Hetzner server. Every push to `main` is built and deployed there automatically. The server runs `next build` and serves the app with `next start` behind nginx, which also routes `/api` and `/socket.io` to the backend.
