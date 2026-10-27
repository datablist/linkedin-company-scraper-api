# LinkedIn Company Scraper API — Python examples

Retrieve company details from LinkedIn company page URLs using Requests or
async HTTPX. Each standalone file shows all the HTTP calls in one place.

## Setup

Use Python 3.12 or newer. From this `python` folder:

```sh
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export DATABLIST_API_KEY='your-personal-api-key'
```

Create your key on the [Datablist API page](https://app.datablist.com/account/api).
Calls use credits; see the current
[credit cost and limits](https://platform.datablist.com/docs/enrichments/tools/linkedin-company-enrichment#credits-and-limits)
and [pricing](https://www.datablist.com/pricing).

## Run an example

**Synchronous, using Requests:**

```sh
python sync_requests.py
```

**Asynchronous, using HTTPX:**

```sh
python async_httpx.py
```

Edit `company_urls` at the bottom of either file. Both scripts submit a background
task, poll every three seconds, and read all result pages. Requests uses blocking
calls. HTTPX uses `await` and `asyncio.sleep`.

## Customize the example

The examples submit standard company page URLs:

```python
company_urls = [
    "https://www.linkedin.com/company/microsoft/",
    "https://www.linkedin.com/company/datablist/",
]
```

For a numeric company ID, use a URL such as
`https://www.linkedin.com/company/1234567890/`, replacing the sample ID with your
company's ID. Use company pages rather than personal profile URLs.

The public API ID is `linkedin-company-enrichment`. The production catalog has
no public settings, so the payload sends `"settings": {}`. See the root README
for [complete JSON requests](../README.md#input-and-output), including a
[numeric company URL example](../README.md#numeric-company-urls).

## Results and limits

Each script prints full results, including `inputId`, `status`, `outputs`,
`creditsUsed`, and `error`. Match results to submitted companies through `inputId`.

See the [complete output example](../README.md#input-and-output) for all 16
production output fields, including company descriptions, websites, industry,
employee and follower counts, headquarters details, and the LinkedIn company ID.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. These examples do not batch larger lists.

## When something fails

HTTP errors raise the library's normal exception. A failed or stopped task
raises an exception with its task ID. A completed task can still have individual
errors or missing fields; check each result's `status` and `error`.

If you stop a script, the task continues on the server. List your
[tasks](https://platform.datablist.com/docs/enrichments/tasks) to check its status
before creating another task.
