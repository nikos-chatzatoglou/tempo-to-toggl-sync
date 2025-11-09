/**
 * Example tests for transform functions
 * Demonstrates how pure functions are easy to test
 */

import { assertEquals } from "jsr:@std/assert";
import { transformTempoWorklogToToggl } from "./transform.ts";
import { TempoToTogglConfig, TempoWorklog } from "../types.ts";

Deno.test("transformTempoWorklogToToggl - basic transformation", () => {
  // Arrange
  const tempoWorklog: TempoWorklog = {
    self: "https://api.tempo.io/4/worklogs/123",
    tempoWorklogId: 123,
    issue: {
      self: "https://jira.example.com/issue/PROJ-123",
      id: 456,
    },
    timeSpentSeconds: 3600,
    billableSeconds: 3600,
    startDate: "2025-10-01",
    startTime: "09:00:00",
    startDateTimeUtc: "2025-10-01T09:00:00Z",
    description: "Working on feature",
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2025-10-01T10:00:00Z",
    author: {
      self: "https://jira.example.com/user/123",
      accountId: "abc123",
    },
    attributes: {
      self: "https://api.tempo.io/4/worklogs/123/attributes",
      values: [],
    },
  };

  const config: TempoToTogglConfig = {
    workspace_id: 12345,
    project_id: 67890,
    created_with: "test-suite",
  };

  // Act
  const result = transformTempoWorklogToToggl(tempoWorklog, config);

  // Assert
  assertEquals(result.workspace_id, 12345);
  assertEquals(result.project_id, 67890);
  assertEquals(result.billable, true);
  assertEquals(result.start, "2025-10-01T09:00:00Z");
  assertEquals(result.duration, 3600);
  assertEquals(result.created_with, "test-suite");
  assertEquals(
    result.description,
    "https://jira.example.com/issue/PROJ-123 | Working on feature",
  );
});

Deno.test("transformTempoWorklogToToggl - non-billable entry", () => {
  // Arrange
  const tempoWorklog: TempoWorklog = {
    self: "https://api.tempo.io/4/worklogs/123",
    tempoWorklogId: 123,
    issue: {
      self: "https://jira.example.com/issue/PROJ-123",
      id: 456,
    },
    timeSpentSeconds: 3600,
    billableSeconds: 0, // Not billable
    startDate: "2025-10-01",
    startTime: "09:00:00",
    startDateTimeUtc: "2025-10-01T09:00:00Z",
    description: "Internal meeting",
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2025-10-01T10:00:00Z",
    author: {
      self: "https://jira.example.com/user/123",
      accountId: "abc123",
    },
    attributes: {
      self: "https://api.tempo.io/4/worklogs/123/attributes",
      values: [],
    },
  };

  const config: TempoToTogglConfig = {
    workspace_id: 12345,
    created_with: "test-suite",
  };

  // Act
  const result = transformTempoWorklogToToggl(tempoWorklog, config);

  // Assert
  assertEquals(result.billable, false);
  assertEquals(result.project_id, undefined);
});
