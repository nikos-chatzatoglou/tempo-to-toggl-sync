/**
 * Configuration management for the time management sync application
 */

export interface AppConfig {
  togglToken: string;
  tempoToken: string;
  togglWorkspaceId: number;
  togglProjectId?: number;
  togglTaskId: number;
  jiraEmail: string;
  jiraApiToken: string;
}

/**
 * Loads and validates environment variables
 * @throws Error if required environment variables are missing
 */
export function loadConfig(): AppConfig {
  const togglToken = Deno.env.get("TOGGL_TOKEN");
  const tempoToken = Deno.env.get("TEMPO_TOKEN");
  const workspaceId = Deno.env.get("TOGGL_WORKSPACE_ID");
  const projectId = Deno.env.get("TOGGL_PROJECT_ID");
  const taskId = Deno.env.get("TOGGL_TASK_ID");
  const jiraEmail = Deno.env.get("JIRA_EMAIL");
  const jiraApiToken = Deno.env.get("JIRA_API_TOKEN");
  if (!togglToken) {
    throw new Error("Missing required environment variable: TOGGL_TOKEN");
  }

  if (!tempoToken) {
    throw new Error("Missing required environment variable: TEMPO_TOKEN");
  }

  if (!workspaceId) {
    throw new Error(
      "Missing required environment variable: TOGGL_WORKSPACE_ID",
    );
  }

  if (!jiraEmail) {
    throw new Error("Missing required environment variable: JIRA_EMAIL");
  }

  if (!jiraApiToken) {
    throw new Error("Missing required environment variable: JIRA_API_TOKEN");
  }

  if (!taskId) {
    throw new Error("Missing required environment variable: TOGGL_TASK_ID");
  }

  return {
    togglToken,
    tempoToken,
    jiraEmail,
    jiraApiToken,
    togglWorkspaceId: parseInt(workspaceId, 10),
    togglProjectId: projectId ? parseInt(projectId, 10) : undefined,
    togglTaskId: parseInt(taskId, 10),
  };
}
