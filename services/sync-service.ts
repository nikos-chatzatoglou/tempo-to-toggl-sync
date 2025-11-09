/**
 * Sync Service
 * Orchestrates the synchronization between Tempo and Toggl
 * Contains business logic and coordinates between API clients and transformations
 */

import { TempoClient } from "../api/tempo-client.ts";
import { TogglClient } from "../api/toggl-client.ts";
import { transformTempoWorklogsToToggl } from "../lib/transform.ts";
import { filterDuplicateEntries } from "../lib/deduplication.ts";
import { TempoToTogglConfig } from "../types.ts";

export interface SyncResult {
  tempoEntriesFetched: number;
  togglEntriesFetched: number;
  uniqueEntries: number;
  duplicatesSkipped: number;
  successfullyCreated: number;
  failedToCreate: number;
  errors: string[];
}

export interface SyncServiceConfig {
  tempoClient: TempoClient;
  togglClient: TogglClient;
  transformConfig: TempoToTogglConfig;
}

/**
 * Service for synchronizing time entries from Tempo to Toggl
 */
export class SyncService {
  constructor(private config: SyncServiceConfig) {}

  /**
   * Synchronizes time entries from Tempo to Toggl for a date range
   * @param fromDate - Start date (YYYY-MM-DD)
   * @param toDate - End date (YYYY-MM-DD)
   * @returns Sync result with statistics
   */
  async syncTimeEntries(fromDate: string, toDate: string): Promise<SyncResult> {
    const errors: string[] = [];

    try {
      // Step 1: Fetch Tempo worklogs
      const tempoWorklogs = await this.config.tempoClient.fetchWorklogs(
        fromDate,
        toDate,
      );

      // Step 2: Enrich worklogs with Jira issue details (key and summary)
      const enrichedWorklogs = await this.config.tempoClient
        .enrichWorklogsWithIssueDetails(
          tempoWorklogs,
        );

      // Step 3: Fetch existing Toggl entries
      const togglEntries = await this.config.togglClient.fetchTimeEntries(
        fromDate,
        toDate,
      );

      // Step 4: Transform Tempo worklogs to Toggl format
      const transformedEntries = transformTempoWorklogsToToggl(
        enrichedWorklogs,
        this.config.transformConfig,
      );

      // Step 5: Filter out duplicates
      const deduplicationResult = filterDuplicateEntries(
        transformedEntries,
        togglEntries,
      );

      // Log what would be posted to Toggl
      console.log("\n📤 Entries ready to post to Toggl:");
      console.log("═".repeat(50));
      deduplicationResult.uniqueEntries.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.description}`);
        console.log(
          `   Start: ${entry.start}, Duration: ${entry.duration}s, Billable: ${entry.billable}`,
        );
      });
      console.log("═".repeat(50));
      console.log(
        `\n⚠️  Returning early - not posting to Toggl (remove this return to enable posting)\n`,
      );

      // Step 6: Create new entries in Toggl
      const createResult = await this.config.togglClient.createTimeEntries(
        deduplicationResult.uniqueEntries,
      );

      // Collect any errors
      if (createResult.failed.length > 0) {
        errors.push(
          ...createResult.failed.map((f) =>
            `Failed to create entry: ${f.error}`
          ),
        );
      }

      return {
        tempoEntriesFetched: tempoWorklogs.length,
        togglEntriesFetched: togglEntries.length,
        uniqueEntries: deduplicationResult.uniqueEntries.length,
        duplicatesSkipped: deduplicationResult.skippedCount,
        successfullyCreated: createResult.successCount,
        failedToCreate: createResult.failedCount,
        errors,
      };
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "Unknown error occurred",
      );

      return {
        tempoEntriesFetched: 0,
        togglEntriesFetched: 0,
        uniqueEntries: 0,
        duplicatesSkipped: 0,
        successfullyCreated: 0,
        failedToCreate: 0,
        errors,
      };
    }
  }
}
