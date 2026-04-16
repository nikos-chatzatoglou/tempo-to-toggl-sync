# Tempo to Toggl Time Entry Sync

A small aplication in Deno, that saves you a lot of time! You can you use this,
if you want to post entries from tempo to toggl.

## 🏗️ Architecture

```
├── api/                  # API clients (HTTP communication)
│   ├── tempo-client.ts   # Tempo API client
│   └── toggl-client.ts   # Toggl API client
├── lib/                  # Pure business logic (no side effects)
│   ├── transform.ts      # Data transformation functions
│   ├── transform.test.ts # Unit tests for transformations
│   ├── deduplication.ts  # Duplicate filtering logic
│   ├── deduplication.test.ts # Unit tests for deduplication
│   └── date-input.ts     # Interactive date input and validation
├── services/             # Orchestration layer
│   └── sync-service.ts   # Coordinates sync process
├── config.ts             # Configuration management
├── types.ts              # TypeScript type definitions
└── main.ts               # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Deno runtime installed
- Tempo API token
- Toggl API token

### Setup

1. Create a `.env` file with your credentials:

```env
TEMPO_TOKEN=your_tempo_token_here
TOGGL_TOKEN=your_toggl_token_here
TOGGL_WORKSPACE_ID=your_workspace_id
TOGGL_PROJECT_ID=your_project_id  # Optional
TOGGL_TASK_ID=your_task_id  # Required
JIRA_EMAIL=your_jira_email
JIRA_API_TOKEN=your_jira_api_token
```

2. Run the sync:

```bash
deno task start
```

3. Enter dates when prompted:

```
🎯 Welcome to Tempo → Toggl Sync!

📅 Enter start date (YYYY-MM-DD): 2025-10-01
✓ Valid date

📅 Enter end date (YYYY-MM-DD): 2025-10-15
✓ Valid date range

🔄 Starting sync...
```

## ⚡ Available Commands

```bash
# Start the sync
deno task start

# Run tests
deno task test

# Type check the code
deno task check
```

## 🔧 Configuration

All configuration is centralized in `config.ts`:

```typescript
export interface AppConfig {
  togglToken: string;
  tempoToken: string;
  togglWorkspaceId: number;
  togglProjectId?: number;
  togglTaskId: number;
  jiraEmail: string;
  jiraApiToken: string;
}
```

**Note about `TOGGL_TASK_ID`**: This is a required field. To find your task ID:
1. Log into Toggl Track
2. Navigate to your project
3. Find or create a task
4. Get the task ID from the API or inspect network requests
5. Add it to your `.env` file

## 📊 Sync Results

The sync service returns detailed statistics:

```typescript
interface SyncResult {
  tempoEntriesFetched: number; // Total entries from Tempo
  togglEntriesFetched: number; // Total existing entries in Toggl
  uniqueEntries: number; // New entries to sync
  duplicatesSkipped: number; // Entries already in Toggl
  successfullyCreated: number; // Successfully synced
  failedToCreate: number; // Failed to sync
  errors: string[]; // Error messages
}
```

## 🎯 Features

- ✅ **Date Validation**: Validates format, prevents future dates, ensures valid
  ranges
- ✅ **Duplicate Detection**: Automatically skips entries that already exist in
  Toggl
- ✅ **Batch Processing**: Syncs multiple entries in one operation
- ✅ **Error Handling**: Continues processing even if individual entries fail
- ✅ **Billable Status**: Preserves billable status from Tempo
- ✅ **Jira Integration**: Includes Jira issue links in descriptions
- ✅ **Testable**: Pure functions with comprehensive tests

## 📄 License

MIT
