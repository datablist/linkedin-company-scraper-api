# LinkedIn Company Scraper API — TypeScript example

Retrieve LinkedIn company details with async/await and built-in `fetch`.
All HTTP calls are in [one standalone file](example.ts).

## Setup and run

From the repository root:

```sh
export DATABLIST_API_KEY='your-personal-api-key'
npx tsx typescript/example.ts
```

With Node.js 24.3 or newer, no runner package is needed:

```sh
node typescript/example.ts
```

From this `typescript` folder, use `npx tsx example.ts` or `node example.ts`.
Create your key on the [Datablist API page](https://app.datablist.com/account/api).
Calls use credits; see the current
[credit cost and limits](https://platform.datablist.com/docs/enrichments/tools/linkedin-company-enrichment#credits-and-limits)
and [pricing](https://www.datablist.com/pricing).

## Customize the example

Edit `companyUrls` at the bottom:

```typescript
const companyUrls = [
  "https://www.linkedin.com/company/microsoft/",
  "https://www.linkedin.com/company/datablist/",
];
```

For a numeric company ID, use a URL such as
`https://www.linkedin.com/company/1234567890/`, replacing the sample ID with your
company's ID. Use company pages rather than personal profile URLs.

The public API ID is `linkedin-company-enrichment`. The production catalog has
no public settings, so the payload sends `settings: {}`. See the root README
for [complete JSON requests](../README.md#input-and-output), including a
[numeric company URL example](../README.md#numeric-company-urls).

## How it works

The script submits one task, polls every three seconds, and reads result pages
until `nextCursor` is `null`. It uses `fetch`, `crypto.randomUUID()`, and
`setTimeout`, with no imports. The example reads your key from the environment.

Each company gets its own `inputId`, including repeated URLs. Full results are
printed as JSON, including statuses, outputs, credits used, and errors.
See the [complete output example](../README.md#input-and-output) for all 16
production output fields, including company descriptions, websites, industry,
employee and follower counts, headquarters details, and the LinkedIn company ID.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. This example does not batch larger lists.

## When something fails

HTTP errors and network failures stop the script. A failed or stopped task
throws an error with its task ID. A completed task can still have individual
errors or missing fields; check each result's `status` and `error`.

If you stop the script, the task continues on the server. List your
[tasks](https://platform.datablist.com/docs/enrichments/tasks) to check its status
before creating another task.
