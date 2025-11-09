/**
 * Core type definitions for Tempo and Toggl data structures
 */

// ============================================================================
// Tempo Types
// ============================================================================

export interface TempoWorklog {
  self: string;
  tempoWorklogId: number;
  issue: Issue;
  timeSpentSeconds: number;
  billableSeconds: number;
  startDate: string; // ISO date (YYYY-MM-DD)
  startTime: string; // HH:mm:ss
  startDateTimeUtc: string; // ISO timestamp
  description: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  author: Author;
  attributes: Attributes;
}

export interface Issue {
  self: string;
  id: number;
  key?: string; // Jira issue key (e.g., "WEB-6546")
  summary?: string; // Jira issue summary/description
}

export interface Author {
  self: string;
  accountId: string;
}

export interface Attributes {
  self: string;
  values: unknown[];
}

// ============================================================================
// Toggl Types
// ============================================================================

export interface TogglTimeEntryPayload {
  workspace_id: number;
  project_id?: number;
  billable: boolean;
  start: string; // Format: YYYY-MM-DDTHH:mm:ssZ (ISO 8601)
  stop?: string; // Format: YYYY-MM-DDTHH:mm:ssZ (optional when duration is provided)
  duration: number; // in seconds
  description: string;
  created_with: string;
  tags?: string[];
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface TempoToTogglConfig {
  workspace_id: number;
  project_id?: number;
  created_with: string;
}
