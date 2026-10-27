# LinkedIn Company Scraper API

Retrieve company details from LinkedIn company page URLs with the
[Datablist](https://www.datablist.com/) LinkedIn Company Scraper API.

Build targeted B2B prospect lists from LinkedIn company pages. Qualify accounts
by industry, company size, and location, then use company descriptions to
personalize your outreach. Bring that LinkedIn data into your CRM and sales
workflows with a few API calls.

[View the API schema](https://api.datablist.com/v1/enrichments/linkedin-company-enrichment).

## Get started

Choose [Python](python/README.md) or [TypeScript](typescript/README.md).
Create a [Personal API Key](https://app.datablist.com/account/api), then run an
example from the repository root.

**Python:**

```sh
cd python
python -m pip install -r requirements.txt
export DATABLIST_API_KEY='your-personal-api-key'
python sync_requests.py
```

**TypeScript:**

```sh
export DATABLIST_API_KEY='your-personal-api-key'
npx tsx typescript/example.ts
```

With Node.js 24.3 or newer, you can also run `node typescript/example.ts` directly.
Run each command block from the repository root.

Calls use account credits. See the current
[credit cost and limits](https://platform.datablist.com/docs/enrichments/tools/linkedin-company-enrichment#credits-and-limits)
and [pricing](https://www.datablist.com/pricing). Each result reports its actual
`creditsUsed`.

## Input and output

Send LinkedIn company page URLs to
`POST https://api.datablist.com/v1/enrichments/tasks`, with your key in the
`X-API-Key` header. No settings are required:

```json
{
  "enrichmentId": "linkedin-company-enrichment",
  "uniqueId": "linkedin-company-example-001",
  "settings": {},
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "companyLinkedInUrl": "https://www.linkedin.com/company/microsoft/"
      }
    }
  ]
}
```

Use a new `uniqueId` for each new task. Give each company its own `inputId` to
match it to its result, including when URLs repeat.

The API returns `202 Accepted` with a task ID in `@id`. Check the task status,
then retrieve its results. This complete response example includes **all 16
production output fields** (sample data):

```json
{
  "taskId": "00000000000040008000000000000001",
  "results": [
    {
      "inputId": "row-1",
      "status": "success",
      "outputs": {
        "companyName": "Example Labs",
        "companyTagline": "Data tools for business teams",
        "companyDescription": "Example Labs builds software for organizing and analyzing company data.",
        "companyWebsite": "https://example.com",
        "companyIndustry": "Software Development",
        "companySpecialities": "Data software, Analytics, Business applications",
        "companyType": "PRIVATELY_HELD",
        "companySize": 42,
        "companyFoundedYear": 2016,
        "companyFollowerCount": 1200,
        "companyLogoUrl": "https://example.com/images/company-logo.png",
        "companyHQCountry": "United States",
        "companyHQCity": "San Francisco",
        "companyHQAddress": "123 Example Street",
        "companyHQPostalCode": "94105",
        "linkedInCompanyId": "1234567890"
      },
      "creditsUsed": "25",
      "error": null
    }
  ],
  "nextCursor": null
}
```

Some values can be missing or null when unavailable. `companySize`,
`companyFoundedYear`, and `companyFollowerCount` are numbers. `linkedInCompanyId`
is a string. The scripts print complete result objects, including any additional
fields returned by the API.

The [production schema](https://api.datablist.com/v1/enrichments/linkedin-company-enrichment)
lists the types and descriptions for every output field.

## Numeric company URLs

If you have a numeric company ID, use it in the company URL. Replace the sample
ID below with your company's ID:

```json
{
  "enrichmentId": "linkedin-company-enrichment",
  "uniqueId": "linkedin-company-numeric-example-001",
  "settings": {},
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "companyLinkedInUrl": "https://www.linkedin.com/company/1234567890/"
      }
    }
  ]
}
```

You can use either URL format in the scripts' editable company lists. Numeric-ID
lookups can have different credit costs; see the
[API pricing details](https://platform.datablist.com/docs/enrichments/tools/linkedin-company-enrichment#credits-and-limits).
Use company page URLs rather than personal profile URLs. If you start with a
domain or website, first use the
[Company to LinkedIn API](https://platform.datablist.com/docs/enrichments/tools/company-to-linkedin)
to find the company's page.

## Try with cURL

Set your key, then submit a company URL:

```sh
export DATABLIST_API_KEY='your-personal-api-key'

curl --request POST 'https://api.datablist.com/v1/enrichments/tasks' \
  --header "X-API-Key: $DATABLIST_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "enrichmentId": "linkedin-company-enrichment",
    "uniqueId": "linkedin-company-curl-001",
    "settings": {},
    "inputs": [
      {"inputId": "row-1", "data": {"companyLinkedInUrl": "https://www.linkedin.com/company/microsoft/"}}
    ]
  }'
```

Copy the returned `@id` into `TASK_ID`. Use a new `uniqueId` for a new task.

```sh
TASK_ID='paste-returned-task-id'

curl "https://api.datablist.com/v1/enrichments/tasks/$TASK_ID" \
  --header "X-API-Key: $DATABLIST_API_KEY"
```

Repeat the status command every few seconds until `status` is `completed`,
`failed`, or `stopped`. Then retrieve the results:

```sh
curl "https://api.datablist.com/v1/enrichments/tasks/$TASK_ID/results" \
  --header "X-API-Key: $DATABLIST_API_KEY"
```

If `nextCursor` is not `null`, pass it as `cursor` to fetch the next page.
The Python and TypeScript examples read every page for you.

## Code examples

| Example | What it shows |
| --- | --- |
| [Synchronous Requests](python/sync_requests.py) | Retrieve company details with blocking HTTP calls. |
| [Asynchronous HTTPX](python/async_httpx.py) | Use `async` and `await` for the same API workflow. |
| [TypeScript](typescript/example.ts) | Use async/await, built-in `fetch`, and no imports. |

Each script is self-contained: submit company URLs, wait for the background task,
and read the results. Both Python clients use asynchronous backend tasks;
Requests blocks while HTTPX uses `await`.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. These examples do not batch larger lists.

## Documentation

- [LinkedIn Company Enrichment API](https://platform.datablist.com/docs/enrichments/tools/linkedin-company-enrichment)
- [Enrichments API quickstart](https://platform.datablist.com/docs/enrichments/quickstart)
- [Task lifecycle](https://platform.datablist.com/docs/enrichments/tasks)

## Other Datablist API examples

- [Company Name to Domain API](https://github.com/datablist/company-name-to-domain-api): find company websites from names.
- [Company Name Cleaner API](https://github.com/datablist/company-name-cleaner-api): clean and standardize company names.
- [LinkedIn Profile Finder API](https://github.com/datablist/linkedin-profile-finder-api): find profiles from names and company keywords.
- [LinkedIn Profile Scraper API](https://github.com/datablist/linkedin-profile-scraper-api): retrieve profile, employment, and education details from LinkedIn URLs.
- [Impressum Scraper API](https://github.com/datablist/impressum-scraper-api): extract business details from website Impressum pages.
- [Waterfall Email Finder API](https://github.com/datablist/waterfall-email-finder-api): find work emails from names and companies or LinkedIn URLs.
