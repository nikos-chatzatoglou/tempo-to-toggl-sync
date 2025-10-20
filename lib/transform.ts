/**
 * Pure transformation functions for converting between Tempo and Toggl formats
 * No side effects, fully testable
 */

import { TempoWorklog, TogglTimeEntryPayload, TempoToTogglConfig } from "../types.ts";

/**
 * Transforms a single Tempo worklog into a Toggl time entry payload
 * @param worklog - Tempo worklog entry
 * @param config - Configuration for the transformation
 * @returns Toggl time entry payload
 */
export function transformTempoWorklogToToggl(
  worklog: TempoWorklog,
  config: TempoToTogglConfig
): TogglTimeEntryPayload {
  const billable = worklog.billableSeconds > 0;
  
  // Build description with Jira ticket information if available
  const description = worklog.issue?.self
    ? `${worklog.issue.self} | ${worklog.description || ""}`
    : worklog.description || "";

  const payload: TogglTimeEntryPayload = {
    workspace_id: config.workspace_id,
    billable,
    start: worklog.startDateTimeUtc,
    duration: worklog.timeSpentSeconds,
    description: description.trim(),
    created_with: config.created_with || "tempo-to-toggl-sync",
  };

  if (config.project_id) {
    payload.project_id = config.project_id;
  }

  return payload;
}

/**
 * Transforms multiple Tempo worklogs into Toggl time entry payloads
 * @param worklogs - Array of Tempo worklog entries
 * @param config - Configuration for the transformation
 * @returns Array of Toggl time entry payloads
 */
export function transformTempoWorklogsToToggl(
  worklogs: TempoWorklog[],
  config: TempoToTogglConfig
): TogglTimeEntryPayload[] {
  return worklogs.map((worklog) => transformTempoWorklogToToggl(worklog, config));
}

