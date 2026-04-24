import 'server-only';

/**
 * Airtable REST API client.
 * Simple fetch-based wrapper — no SDK dependency.
 * Handles auth, rate limiting (5 req/sec), and batch upserts (10 records per call).
 */

const AIRTABLE_API_URL = 'https://api.airtable.com/v0';
const BATCH_SIZE = 10;
const RATE_LIMIT_DELAY_MS = 200;

function getConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error('AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set');
  }

  return { apiKey, baseId };
}

function headers(): HeadersInit {
  const { apiKey } = getConfig();
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Upsert records to an Airtable table.
 * Uses the Airtable "upsert" feature (fieldsToMergeOn) to update existing or create new.
 */
export async function upsertRecords(
  tableName: string,
  records: Array<{ fields: Record<string, unknown> }>,
  mergeOnFields: string[] = ['user_id']
): Promise<{ created: number; updated: number }> {
  const { baseId } = getConfig();
  const url = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(tableName)}`;

  let created = 0;
  let updated = 0;

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    let response: Response | null = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      response = await fetch(url, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({
          performUpsert: { fieldsToMergeOn: mergeOnFields },
          records: batch,
        }),
      });

      if (response.status === 429) {
        // Rate limited — exponential backoff
        const retryAfter = Math.pow(2, attempt + 1) * 1000;
        console.warn(`Airtable rate limited, retrying in ${retryAfter}ms (attempt ${attempt + 1}/${maxRetries})`);
        await delay(retryAfter);
        continue;
      }

      break;
    }

    if (!response || !response.ok) {
      const error = await response?.json().catch(() => ({}));
      console.error('Airtable upsert failed:', response?.status, error);
      throw new Error(`Airtable upsert failed: ${response?.status}`);
    }

    const result = await response.json();
    created += result.createdRecords?.length ?? 0;
    updated += (result.records?.length ?? 0) - (result.createdRecords?.length ?? 0);

    // Rate limit: wait between batches
    if (i + BATCH_SIZE < records.length) {
      await delay(RATE_LIMIT_DELAY_MS);
    }
  }

  return { created, updated };
}

/**
 * List all records from an Airtable table (with pagination).
 */
export async function listRecords(
  tableName: string,
  maxRecords = 100
): Promise<Array<Record<string, unknown>>> {
  const { baseId } = getConfig();
  const url = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(tableName)}?maxRecords=${maxRecords}`;

  const response = await fetch(url, { headers: headers() });

  if (!response.ok) {
    throw new Error(`Airtable list failed: ${response.status}`);
  }

  const data = await response.json();
  return data.records || [];
}
