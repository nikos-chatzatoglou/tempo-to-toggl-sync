/**
 * Tests for configuration loading and validation
 */

import { assertEquals } from "@std/assert";
import { loadConfig } from "./config.ts";

// Helper function to save and restore environment variables
function withEnv(
  envVars: Record<string, string | undefined>,
  testFn: () => void,
) {
  const originalEnv: Record<string, string | undefined> = {};
  const keysToRestore = new Set<string>();

  // Save original values and set new ones
  for (const [key, value] of Object.entries(envVars)) {
    originalEnv[key] = Deno.env.get(key);
    keysToRestore.add(key);
    if (value === undefined) {
      Deno.env.delete(key);
    } else {
      Deno.env.set(key, value);
    }
  }

  try {
    testFn();
  } finally {
    // Restore original values
    for (const key of keysToRestore) {
      if (originalEnv[key] === undefined) {
        Deno.env.delete(key);
      } else {
        Deno.env.set(key, originalEnv[key]!);
      }
    }
  }
}

Deno.test("loadConfig - success with all required variables", () => {
  withEnv(
    {
      TOGGL_TOKEN: "toggl-token-123",
      TEMPO_TOKEN: "tempo-token-456",
      TOGGL_WORKSPACE_ID: "12345",
      JIRA_EMAIL: "user@example.com",
      JIRA_API_TOKEN: "jira-token-789",
    },
    () => {
      // Act
      const config = loadConfig();

      // Assert
      assertEquals(config.togglToken, "toggl-token-123");
      assertEquals(config.tempoToken, "tempo-token-456");
      assertEquals(config.togglWorkspaceId, 12345);
      assertEquals(config.jiraEmail, "user@example.com");
      assertEquals(config.jiraApiToken, "jira-token-789");
      assertEquals(config.togglProjectId, undefined);
    },
  );
});

Deno.test("loadConfig - success with optional project ID", () => {
  withEnv(
    {
      TOGGL_TOKEN: "toggl-token-123",
      TEMPO_TOKEN: "tempo-token-456",
      TOGGL_WORKSPACE_ID: "12345",
      TOGGL_PROJECT_ID: "67890",
      JIRA_EMAIL: "user@example.com",
      JIRA_API_TOKEN: "jira-token-789",
    },
    () => {
      // Act
      const config = loadConfig();

      // Assert
      assertEquals(config.togglWorkspaceId, 12345);
      assertEquals(config.togglProjectId, 67890);
    },
  );
});

Deno.test("loadConfig - throws error when TOGGL_TOKEN is missing", () => {
  withEnv(
    {
      TOGGL_TOKEN: undefined,
      TEMPO_TOKEN: "tempo-token-456",
      TOGGL_WORKSPACE_ID: "12345",
      JIRA_EMAIL: "user@example.com",
      JIRA_API_TOKEN: "jira-token-789",
    },
    () => {
      // Act & Assert
      let errorThrown = false;
      try {
        loadConfig();
      } catch (error) {
        errorThrown = true;
        assertEquals(
          error instanceof Error,
          true,
        );
        if (error instanceof Error) {
          assertEquals(
            error.message,
            "Missing required environment variable: TOGGL_TOKEN",
          );
        }
      }
      assertEquals(errorThrown, true);
    },
  );
});

Deno.test("loadConfig - throws error when TEMPO_TOKEN is missing", () => {
  withEnv(
    {
      TOGGL_TOKEN: "toggl-token-123",
      TEMPO_TOKEN: undefined,
      TOGGL_WORKSPACE_ID: "12345",
      JIRA_EMAIL: "user@example.com",
      JIRA_API_TOKEN: "jira-token-789",
    },
    () => {
      // Act & Assert
      let errorThrown = false;
      try {
        loadConfig();
      } catch (error) {
        errorThrown = true;
        assertEquals(
          error instanceof Error,
          true,
        );
        if (error instanceof Error) {
          assertEquals(
            error.message,
            "Missing required environment variable: TEMPO_TOKEN",
          );
        }
      }
      assertEquals(errorThrown, true);
    },
  );
});

Deno.test("loadConfig - throws error when TOGGL_WORKSPACE_ID is missing", () => {
  withEnv(
    {
      TOGGL_TOKEN: "toggl-token-123",
      TEMPO_TOKEN: "tempo-token-456",
      TOGGL_WORKSPACE_ID: undefined,
      JIRA_EMAIL: "user@example.com",
      JIRA_API_TOKEN: "jira-token-789",
    },
    () => {
      // Act & Assert
      let errorThrown = false;
      try {
        loadConfig();
      } catch (error) {
        errorThrown = true;
        assertEquals(
          error instanceof Error,
          true,
        );
        if (error instanceof Error) {
          assertEquals(
            error.message,
            "Missing required environment variable: TOGGL_WORKSPACE_ID",
          );
        }
      }
      assertEquals(errorThrown, true);
    },
  );
});

Deno.test("loadConfig - throws error when JIRA_EMAIL is missing", () => {
  withEnv(
    {
      TOGGL_TOKEN: "toggl-token-123",
      TEMPO_TOKEN: "tempo-token-456",
      TOGGL_WORKSPACE_ID: "12345",
      JIRA_EMAIL: undefined,
      JIRA_API_TOKEN: "jira-token-789",
    },
    () => {
      // Act & Assert
      let errorThrown = false;
      try {
        loadConfig();
      } catch (error) {
        errorThrown = true;
        assertEquals(
          error instanceof Error,
          true,
        );
        if (error instanceof Error) {
          assertEquals(
            error.message,
            "Missing required environment variable: JIRA_EMAIL",
          );
        }
      }
      assertEquals(errorThrown, true);
    },
  );
});

Deno.test("loadConfig - throws error when JIRA_API_TOKEN is missing", () => {
  withEnv(
    {
      TOGGL_TOKEN: "toggl-token-123",
      TEMPO_TOKEN: "tempo-token-456",
      TOGGL_WORKSPACE_ID: "12345",
      JIRA_EMAIL: "user@example.com",
      JIRA_API_TOKEN: undefined,
    },
    () => {
      // Act & Assert
      let errorThrown = false;
      try {
        loadConfig();
      } catch (error) {
        errorThrown = true;
        assertEquals(
          error instanceof Error,
          true,
        );
        if (error instanceof Error) {
          assertEquals(
            error.message,
            "Missing required environment variable: JIRA_API_TOKEN",
          );
        }
      }
      assertEquals(errorThrown, true);
    },
  );
});

Deno.test("loadConfig - parses workspace ID correctly", () => {
  withEnv(
    {
      TOGGL_TOKEN: "toggl-token-123",
      TEMPO_TOKEN: "tempo-token-456",
      TOGGL_WORKSPACE_ID: "99999",
      JIRA_EMAIL: "user@example.com",
      JIRA_API_TOKEN: "jira-token-789",
    },
    () => {
      // Act
      const config = loadConfig();

      // Assert
      assertEquals(config.togglWorkspaceId, 99999);
      assertEquals(typeof config.togglWorkspaceId, "number");
    },
  );
});

Deno.test("loadConfig - parses optional project ID correctly", () => {
  withEnv(
    {
      TOGGL_TOKEN: "toggl-token-123",
      TEMPO_TOKEN: "tempo-token-456",
      TOGGL_WORKSPACE_ID: "12345",
      TOGGL_PROJECT_ID: "54321",
      JIRA_EMAIL: "user@example.com",
      JIRA_API_TOKEN: "jira-token-789",
    },
    () => {
      // Act
      const config = loadConfig();

      // Assert
      assertEquals(config.togglProjectId, 54321);
      assertEquals(typeof config.togglProjectId, "number");
    },
  );
});

