/**
 * Example tests for deduplication functions
 * Demonstrates how pure functions are easy to test
 */

import { assertEquals } from "jsr:@std/assert";
import { filterDuplicateEntries, normalizeTimestamp } from "./deduplication.ts";
import { TogglTimeEntryPayload } from "../types.ts";

Deno.test("normalizeTimestamp - handles different timezone formats", () => {
  const timestamp1 = "2025-10-01T09:00:00Z";
  const timestamp2 = "2025-10-01T09:00:00+00:00";
  const timestamp3 = "2025-10-01T11:00:00+02:00"; // Same as above in UTC

  assertEquals(normalizeTimestamp(timestamp1), normalizeTimestamp(timestamp2));
  assertEquals(normalizeTimestamp(timestamp1), normalizeTimestamp(timestamp3));
});

Deno.test("filterDuplicateEntries - filters out duplicates correctly", () => {
  // Arrange
  const newEntries: TogglTimeEntryPayload[] = [
    {
      workspace_id: 123,
      billable: true,
      start: "2025-10-01T09:00:00Z",
      duration: 3600,
      description: "Entry 1",
      created_with: "test",
    },
    {
      workspace_id: 123,
      billable: true,
      start: "2025-10-01T10:00:00Z",
      duration: 3600,
      description: "Entry 2",
      created_with: "test",
    },
    {
      workspace_id: 123,
      billable: true,
      start: "2025-10-01T11:00:00Z",
      duration: 3600,
      description: "Entry 3",
      created_with: "test",
    },
  ];

  const existingEntries = [
    { start: "2025-10-01T09:00:00+00:00" }, // Duplicate of Entry 1 (different timezone notation)
  ];

  // Act
  const result = filterDuplicateEntries(newEntries, existingEntries);

  // Assert
  assertEquals(result.uniqueEntries.length, 2);
  assertEquals(result.duplicates.length, 1);
  assertEquals(result.skippedCount, 1);
  assertEquals(result.uniqueEntries[0].description, "Entry 2");
  assertEquals(result.uniqueEntries[1].description, "Entry 3");
  assertEquals(result.duplicates[0].description, "Entry 1");
});

Deno.test("filterDuplicateEntries - handles no duplicates", () => {
  // Arrange
  const newEntries: TogglTimeEntryPayload[] = [
    {
      workspace_id: 123,
      billable: true,
      start: "2025-10-01T09:00:00Z",
      duration: 3600,
      description: "Entry 1",
      created_with: "test",
    },
  ];

  const existingEntries = [
    { start: "2025-10-01T10:00:00Z" }, // Different time
  ];

  // Act
  const result = filterDuplicateEntries(newEntries, existingEntries);

  // Assert
  assertEquals(result.uniqueEntries.length, 1);
  assertEquals(result.duplicates.length, 0);
  assertEquals(result.skippedCount, 0);
});

Deno.test("filterDuplicateEntries - handles all duplicates", () => {
  // Arrange
  const newEntries: TogglTimeEntryPayload[] = [
    {
      workspace_id: 123,
      billable: true,
      start: "2025-10-01T09:00:00Z",
      duration: 3600,
      description: "Entry 1",
      created_with: "test",
    },
    {
      workspace_id: 123,
      billable: true,
      start: "2025-10-01T10:00:00Z",
      duration: 3600,
      description: "Entry 2",
      created_with: "test",
    },
  ];

  const existingEntries = [
    { start: "2025-10-01T09:00:00Z" },
    { start: "2025-10-01T10:00:00Z" },
  ];

  // Act
  const result = filterDuplicateEntries(newEntries, existingEntries);

  // Assert
  assertEquals(result.uniqueEntries.length, 0);
  assertEquals(result.duplicates.length, 2);
  assertEquals(result.skippedCount, 2);
});
