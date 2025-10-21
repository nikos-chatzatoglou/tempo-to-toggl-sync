/**
 * Toggl API client
 * Handles all HTTP communication with the Toggl Track API
 */

import { TogglTimeEntryPayload } from "../types.ts";

export interface TogglTimeEntry {
  id: number;
  workspace_id: number;
  project_id: number | null;
  task_id: number | null;
  billable: boolean;
  start: string; // ISO 8601 timestamp
  stop: string | null; // ISO 8601 timestamp or null if running
  duration: number; // seconds
  description: string;
  tags: string[];
  tag_ids: number[];
  duronly: boolean;
  at: string; // ISO 8601 timestamp
  server_deleted_at: string | null;
  user_id: number;
  uid: number;
  wid: number;
  pid?: number;
}

export interface CreateEntriesResult {
  success: TogglTimeEntry[];
  failed: Array<{
    entry: TogglTimeEntryPayload;
    error: string;
  }>;
  successCount: number;
  failedCount: number;
}

export interface TogglClientConfig {
  apiToken: string;
  baseUrl?: string;
}

/**
 * Toggl API Client
 */
export class TogglClient {
  private readonly apiToken: string;
  private readonly baseUrl: string;

  constructor(config: TogglClientConfig) {
    this.apiToken = config.apiToken;
    this.baseUrl = config.baseUrl || "https://api.track.toggl.com/api/v9";
  }

  /**
   * Creates authorization header for Toggl API
   */
  private getAuthHeader(): string {
    return `Basic ${btoa(`${this.apiToken}:api_token`)}`;
  }

  /**
   * Fetches time entries within a date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Array of time entries
   */
  async fetchTimeEntries(
    startDate: string,
    endDate: string
  ): Promise<TogglTimeEntry[]> {
    const url = `${this.baseUrl}/me/time_entries?start_date=${startDate}&end_date=${endDate}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to fetch Toggl time entries: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    return await response.json();
  }

  /**
   * Creates a single time entry in Toggl
   * @param entry - Time entry payload
   * @returns Created time entry with ID
   */
  async createTimeEntry(entry: TogglTimeEntryPayload): Promise<TogglTimeEntry> {
    const url = `${this.baseUrl}/workspaces/${entry.workspace_id}/time_entries`;

    console.log(`  📤 POST ${url}`);
    console.log(`  📦 Workspace ID in payload: ${entry.workspace_id}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": this.getAuthHeader(),
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`  ❌ Response: ${response.status} ${response.statusText}`);
      console.error(`  ❌ Body: ${errorBody}`);
      throw new Error(
        `Failed to create time entry: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    return await response.json();
  }

  /**
   * Creates multiple time entries in Toggl
   * Processes entries sequentially to avoid rate limiting
   * @param entries - Array of time entry payloads
   * @returns Result with successful and failed entries
   */
  async createTimeEntries(
    entries: TogglTimeEntryPayload[]
  ): Promise<CreateEntriesResult> {
    const result: CreateEntriesResult = {
      success: [],
      failed: [],
      successCount: 0,
      failedCount: 0,
    };

    for (const entry of entries) {
      try {
        const createdEntry = await this.createTimeEntry(entry);
        result.success.push(createdEntry);
        result.successCount++;
      } catch (error) {
        result.failed.push({
          entry,
          error: error instanceof Error ? error.message : String(error),
        });
        result.failedCount++;
      }
    }

    return result;
  }
}

