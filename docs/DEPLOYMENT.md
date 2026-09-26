# Deployment

The production website is [ground-rwa.vercel.app](https://ground-rwa.vercel.app), hosted in the Vercel project `ground-rwa` under the owner's `nulia8-3465s-projects` scope.

The first production deployment reached READY on 26 September 2026 from application commit `184d61a`. The project uses the Next.js framework preset in `vercel.json`. Its catalogue and identity media are included with the application, and its quote and public-wallet endpoints use the Node.js runtime.

## Publish an update

From the linked project directory, run:

```sh
npm run check
vercel deploy --prod --yes --archive=tgz --scope nulia8-3465s-projects
```

The local `.vercel` directory stores the project association and remains ignored by Git. Deployment currently uses the authenticated CLI; a Git integration has not been configured, so pushing a commit alone does not publish the website.

`.vercelignore` excludes local environment files, dependencies, build caches, proof screenshots and the source ZIP. `.env.example` documents optional configuration. The current quote and balance endpoints work without a project-specific environment secret; a custom RPC can be configured later if needed.

## Project destinations

Update `src/lib/project.ts` with the owner's contract address and official destinations. Until those values are supplied, the contract card displays TBA and disables Copy, Buy, Explorer, DEX Screener and Jupiter. Adding an address does not enable transaction execution in Trade.

The website's GitHub destination is [johh7653-cell](https://github.com/johh7653-cell). X temporarily opens the platform homepage at the owner's request.

## Production verification

The deployed catalogue passed all 83 read-only HTTP checks, including complete record comparison, pagination, filters, detail samples and error boundaries. Public quote and Solana balance requests returned valid responses; an invalid balance address returned 400. The deployed logo matches the owner's supplied PNG byte-for-byte.

The embedded browser's proxy could not load the Vercel page. The visual checks and saved screenshots use the same application build on the local production server; the public HTTP checks above were performed independently.
