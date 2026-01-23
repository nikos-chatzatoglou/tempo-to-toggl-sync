/**
 * Pure transformation functions for converting between Tempo and Toggl formats
 */

import {
  TempoToTogglConfig,
  TempoWorklog,
  TogglTimeEntryPayload,
} from "../types.ts";

/**
 * Transforms a single Tempo worklog into a Toggl time entry payload
 * @param worklog - Tempo worklog entry
 * @param config - Configuration for the transformation
 * @returns Toggl time entry payload
 */
export function transformTempoWorklogToToggl(
  worklog: TempoWorklog,
  config: TempoToTogglConfig,
): TogglTimeEntryPayload {
  const billable = worklog.billableSeconds > 0;

  let description = "";
  if (worklog.issue?.key) {
    description = `${worklog.issue.key}: ${worklog.description || ""}`;
  } else if (worklog.issue?.self) {
    description = `${worklog.issue.self} | ${worklog.description || ""}`;
  } else {
    // No issue information available
    description = worklog.description || "";
  }

  const payload: TogglTimeEntryPayload = {
    workspace_id: config.workspace_id,
    task_id: config.task_id,
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
  config: TempoToTogglConfig,
): TogglTimeEntryPayload[] {
  return worklogs.map((worklog) =>
    transformTempoWorklogToToggl(worklog, config)
  );
}
