## SecureLearning Microsite

Minimal Next.js 14 App Router project for the SecureLearning awareness platform microsite. Built with TypeScript and TailwindCSS, ready to deploy on Vercel.

[Check it Out](https://pei-securelearning.vercel.app/)

## Prerequisites

- Node.js 18.17+ (or any version supported by Next.js 14)
- npm 9+ (bundled with recent Node releases)

## Installation

Install dependencies after cloning the repo:

```bash
npm install
```

## Local Development

Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000` to view the site. Changes under `src/` hot-reload automatically.

## Building for Production

Create an optimized production build and preview it locally:

```bash
npm run build
npm run start
```

## Linting

Run the project-wide lint checks:

```bash
npm run lint
```

## Deployment

Deploy directly to Vercel (recommended). On the first deploy, Vercel will detect the Next.js project and configure defaults:

```bash
npm install -g vercel
vercel
```

You can also connect the GitHub repository and enable automatic deploys through the Vercel dashboard.
