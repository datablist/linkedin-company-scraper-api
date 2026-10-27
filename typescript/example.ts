/**
 * Retrieve LinkedIn company details with async/await and built-in fetch.
 *
 * Submit company page URLs, wait for the background task, and read every result
 * page. Polling pauses for three seconds between status checks.
 *
 * Set DATABLIST_API_KEY, then run from the repository root:
 * npx tsx typescript/example.ts
 * Or with Node.js 24.3 or newer: node typescript/example.ts
 *
 * Edit companyUrls at the bottom to use your own pages. Standard company URLs
 * and numeric company URLs are supported. The public API ID is
 * linkedin-company-enrichment, and no settings are required.
 *
 * One task accepts up to 10,000 inputs. Calls use account credits.
 * Complete result objects are printed as JSON, including statuses and errors.
 */

/** Submit one task, wait for it to finish, and return its results. */
async function scrapeCompanies(companyUrls: string[], apiKey: string): Promise<object[]> {
  const tasksUrl = "https://api.datablist.com/v1/enrichments/tasks";
  const headers = {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  };
  const inputs = companyUrls.map((companyLinkedInUrl, index) => {
    return {
      inputId: `row-${index + 1}`,
      data: { companyLinkedInUrl },
    };
  });

  // 1. Submit the inputs.
  const payload = {
    enrichmentId: "linkedin-company-enrichment",
    uniqueId: crypto.randomUUID(),
    settings: {},
    inputs,
  };
  let response = await fetch(tasksUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  let task = await response.json();
  const taskId = task["@id"];
  const taskUrl = `${tasksUrl}/${taskId}`;

  // 2. Wait for the background task to finish.
  while (!["completed", "failed", "stopped"].includes(task.status)) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 3000);
    });
    response = await fetch(taskUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    task = await response.json();
  }

  if (task.status !== "completed") {
    throw new Error(`Task ${taskId} ${task.status}`);
  }

  // 3. Read every result page, until nextCursor is null.
  const results: object[] = [];
  const params = new URLSearchParams({ limit: "100" });
  while (true) {
    response = await fetch(`${taskUrl}/results?${params}`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const page = await response.json();
    results.push(...page.results);
    if (page.nextCursor === null) {
      break;
    }
    params.set("cursor", page.nextCursor);
  }

  return results;
}

const apiKey = process.env.DATABLIST_API_KEY ?? "";
const companyUrls = [
  "https://www.linkedin.com/company/microsoft/",
  "https://www.linkedin.com/company/datablist/",
];

const results = await scrapeCompanies(companyUrls, apiKey);
console.log(JSON.stringify(results, null, 2));
