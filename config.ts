/**
 * Configuration management for the time management sync application
 * Centralizes environment variable access and validation
 */

export interface AppConfig {
  togglToken: string;
  tempoToken: string;
  togglWorkspaceId: number;
  togglProjectId?: number;
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
console.log(togglToken, tempoToken, workspaceId, projectId);
  if (!togglToken) {
    throw new Error("Missing required environment variable: TOGGL_TOKEN");
  }

  if (!tempoToken) {
    throw new Error("Missing required environment variable: TEMPO_TOKEN");
  }

  if (!workspaceId) {
    throw new Error("Missing required environment variable: TOGGL_WORKSPACE_ID");
  }

  return {
    togglToken,
    tempoToken,
    togglWorkspaceId: parseInt(workspaceId, 10),
    togglProjectId: projectId ? parseInt(projectId, 10) : undefined,
  };
}

