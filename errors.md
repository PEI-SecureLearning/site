01:09:47.165 Running build in Washington, D.C., USA (East) – iad1
01:09:47.166 Build machine configuration: 2 cores, 8 GB
01:09:47.181 Cloning github.com/PEI-SecureLearning/site (Branch: main, Commit: 408124f)
01:09:47.931 Cloning completed: 750.000ms
01:09:49.200 Restored build cache from previous deployment (4aZWy2T7rZhYyHU6CMMHHkAAqJZR)
01:09:49.603 Running "vercel build"
01:09:49.991 Vercel CLI 48.2.9
01:09:50.313 Installing dependencies...
01:09:51.556 
01:09:51.557 up to date in 1s
01:09:51.557 
01:09:51.557 222 packages are looking for funding
01:09:51.558   run `npm fund` for details
01:09:51.587 Detected Next.js version: 15.5.4
01:09:51.591 Running "npm run build"
01:09:51.702 
01:09:51.702 > site@0.1.0 build
01:09:51.702 > next build --turbopack
01:09:51.702 
01:09:52.816    ▲ Next.js 15.5.4 (Turbopack)
01:09:52.817 
01:09:52.895    Creating an optimized production build ...
01:10:03.916  ✓ Finished writing to disk in 23ms
01:10:03.941  ✓ Compiled successfully in 10.3s
01:10:03.946    Linting and checking validity of types ...
01:10:09.611    Collecting page data ...
01:10:10.486    Generating static pages (0/12) ...
01:10:11.308  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/404". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
01:10:11.308     at g (/vercel/path0/.next/server/chunks/ssr/node_modules_e7959212._.js:4:5016)
01:10:11.308     at m (/vercel/path0/.next/server/chunks/ssr/node_modules_e7959212._.js:4:6650)
01:10:11.308     at o (/vercel/path0/.next/server/chunks/ssr/_89c8c20e._.js:1:4078)
01:10:11.308     at n3 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:82831)
01:10:11.308     at n6 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:84601)
01:10:11.308     at n6 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:101560)
01:10:11.308     at n5 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:104801)
01:10:11.308     at n7 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:102219)
01:10:11.309     at aa (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:108211)
01:10:11.309     at ae (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106833)
01:10:11.309 Error occurred prerendering page "/_not-found". Read more: https://nextjs.org/docs/messages/prerender-error
01:10:11.309 Export encountered an error on /_not-found/page: /_not-found, exiting the build.
01:10:11.342  ⨯ Next.js build worker exited with code: 1 and signal: null
01:10:11.369 Error: Command "npm run build" exited with 1