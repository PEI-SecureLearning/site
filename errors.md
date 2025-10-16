23:03:30.747 Running build in Washington, D.C., USA (East) – iad1
23:03:30.748 Build machine configuration: 2 cores, 8 GB
23:03:30.787 Cloning github.com/PEI-SecureLearning/site (Branch: main, Commit: af3734b)
23:03:31.086 Cloning completed: 299.000ms
23:03:32.801 Restored build cache from previous deployment (6atTDMHWh3jzALRuZiYAbNQGRrVu)
23:03:33.213 Running "vercel build"
23:03:33.603 Vercel CLI 48.2.9
23:03:33.942 Installing dependencies...
23:03:35.391 
23:03:35.392 added 1 package, and removed 1 package in 1s
23:03:35.392 
23:03:35.392 222 packages are looking for funding
23:03:35.392   run `npm fund` for details
23:03:35.422 Detected Next.js version: 15.5.4
23:03:35.427 Running "npm run build"
23:03:35.534 
23:03:35.534 > site@0.1.0 build
23:03:35.534 > next build --turbopack
23:03:35.535 
23:03:36.651    ▲ Next.js 15.5.4 (Turbopack)
23:03:36.651 
23:03:36.724    Creating an optimized production build ...
23:03:47.328  ✓ Finished writing to disk in 24ms
23:03:47.354  ✓ Compiled successfully in 9.9s
23:03:47.365    Linting and checking validity of types ...
23:03:51.618 
23:03:51.619 Failed to compile.
23:03:51.619 
23:03:51.619 ./src/components/ShinyText.tsx
23:03:51.619 16:48  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
23:03:51.619 
23:03:51.619 ./src/components/effects/DarkVeil.tsx
23:03:51.619 164:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
23:03:51.619 
23:03:51.619 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
23:03:51.653 Error: Command "npm run build" exited with 1