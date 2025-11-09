/**
 * Pure deduplication logic for filtering out existing entries
 */

import { TogglTimeEntryPayload } from "../types.ts";

export interface DeduplicationResult {
  uniqueEntries: TogglTimeEntryPayload[];
  duplicates: TogglTimeEntryPayload[];
  skippedCount: number;
}

export interface ExistingEntry {
  start: string;
}

/**
 * Normalizes a timestamp to ISO format for consistent comparison
 * @param timestamp - ISO 8601 timestamp string
 * @returns Normalized ISO string
 */
export function normalizeTimestamp(timestamp: string): string {
  return new Date(timestamp).toISOString();
}

/**
 * Filters out entries that already exist based on start time
 *
 * @param newEntries - Entries to be checked
 * @param existingEntries - Entries that already exist (only needs start field)
 * @returns Result containing unique entries and duplicates
 */
export function filterDuplicateEntries(
  newEntries: TogglTimeEntryPayload[],
  existingEntries: ExistingEntry[],
): DeduplicationResult {
  const duplicates: TogglTimeEntryPayload[] = [];

  // Create a Set of normalized existing start times for O(1) lookup
  const existingStartTimes = new Set(
    existingEntries.map((entry) => normalizeTimestamp(entry.start)),
  );

  // Filter out entries that already exist
  const uniqueEntries = newEntries.filter((newEntry) => {
    const normalizedStart = normalizeTimestamp(newEntry.start);
    const isDuplicate = existingStartTimes.has(normalizedStart);

    if (isDuplicate) {
      duplicates.push(newEntry);
    }

    return !isDuplicate;
  });

  return {
    uniqueEntries,
    duplicates,
    skippedCount: duplicates.length,
  };
}
