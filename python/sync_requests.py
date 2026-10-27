"""Retrieve LinkedIn company details with the Datablist API using Requests.

This standalone example submits a small list of LinkedIn company page URLs,
waits for the background task to finish, and reads all pages of results.
HTTP calls and three-second polling pauses block until they finish.

The public API ID is linkedin-company-enrichment. No settings are required.
Results include company descriptions, industries, websites, employee counts,
and headquarters details when available. Complete results are printed,
including statuses, credits used, and errors.

Set DATABLIST_API_KEY and run: python sync_requests.py
Edit company_urls at the bottom to use your own company pages. Standard company
URLs and numeric company URLs are supported. This example submits one task of
up to 10,000 inputs. Calls use account credits.
"""

import os
import time
import uuid

import requests


def scrape_companies(company_urls: list[str], api_key: str) -> list[dict]:
    """Submit one task, wait for it to finish, and return its results."""
    tasks_url = "https://api.datablist.com/v1/enrichments/tasks"
    headers = {"X-API-Key": api_key}
    inputs = [
        {"inputId": f"row-{index}", "data": {"companyLinkedInUrl": company_url}}
        for index, company_url in enumerate(company_urls, start=1)
    ]

    # 1. Submit the company page URLs.
    payload = {
        "enrichmentId": "linkedin-company-enrichment",
        "uniqueId": str(uuid.uuid4()),
        "settings": {},
        "inputs": inputs,
    }
    response = requests.post(tasks_url, headers=headers, json=payload)
    response.raise_for_status()
    task = response.json()
    task_id = task["@id"]
    task_url = f"{tasks_url}/{task_id}"

    # 2. Wait for the background task to finish.
    while task["status"] not in ("completed", "failed", "stopped"):
        time.sleep(3)
        response = requests.get(task_url, headers=headers)
        response.raise_for_status()
        task = response.json()

    if task["status"] != "completed":
        raise RuntimeError(f"Task {task_id} {task['status']}: {task.get('error')}")

    # 3. Read the results, following pagination when needed.
    results = []
    results_url = f"{task_url}/results"
    params = {"limit": 100}
    while True:
        response = requests.get(results_url, headers=headers, params=params)
        response.raise_for_status()
        page = response.json()
        results.extend(page["results"])
        next_cursor = page["nextCursor"]
        if next_cursor is None:
            break
        params["cursor"] = next_cursor

    return results


if __name__ == "__main__":
    api_key = os.environ["DATABLIST_API_KEY"]
    company_urls = [
        "https://www.linkedin.com/company/microsoft/",
        "https://www.linkedin.com/company/datablist/",
    ]

    results = scrape_companies(company_urls, api_key)
    for result in results:
        print(result)
