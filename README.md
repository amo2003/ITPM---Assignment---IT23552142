# Playwright Automation – IT3040 Assignment 1

## Prerequisites
- Node.js (LTS recommended)

## Install
```bash
npm install
```

## Run tests
From the project root:

```bash
npm test
```

Run only the Singlish suite:

```bash
npm run test:singlish
```

## Debug (recommended for external sites)
Run headed so you can see whether the site is converting in real time:

```bash
npx playwright test --headed --project=chromium
```

Open the HTML report:

```bash
npm run report
```

