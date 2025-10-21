# Tempo to Toggl Time Entry Sync

A small aplication in Deno, that saves you a lot of time! 
You can you use this, if you want to post entries from tempo to toggl. 


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

## 📚 Usage Examples

### Basic Sync

```typescript
import { load } from "@std/dotenv";
import { loadConfig } from "./config.ts";
import { TempoClient } from "./api/tempo-client.ts";
import { TogglClient } from "./api/toggl-client.ts";
import { SyncService } from "./services/sync-service.ts";

await load({ export: true });

const config = loadConfig();
const tempoClient = new TempoClient({ apiToken: config.tempoToken });
const togglClient = new TogglClient({ apiToken: config.togglToken });

const syncService = new SyncService({
  tempoClient,
  togglClient,
  transformConfig: {
    workspace_id: config.togglWorkspaceId,
    project_id: config.togglProjectId,
    created_with: "tempo-to-toggl-sync",
  },
});

const result = await syncService.syncTimeEntries("2025-10-01", "2025-10-01");
console.log(result);
```

### Using Individual Components

```typescript
// Fetch data
const tempoClient = new TempoClient({ apiToken: "..." });
const worklogs = await tempoClient.fetchWorklogs("2025-10-01", "2025-10-01");

// Transform data
import { transformTempoWorklogsToToggl } from "./lib/transform.ts";
const togglEntries = transformTempoWorklogsToToggl(worklogs, {
  workspace_id: 12345,
  created_with: "my-app",
});

// Filter duplicates
import { filterDuplicateEntries } from "./lib/deduplication.ts";
const togglClient = new TogglClient({ apiToken: "..." });
const existing = await togglClient.fetchTimeEntries("2025-10-01", "2025-10-01");
const filtered = filterDuplicateEntries(togglEntries, existing);

// Create entries
const result = await togglClient.createTimeEntries(filtered.uniqueEntries);
```

## 🧪 Testing

The new architecture makes testing straightforward:

```bash
# Run all tests
deno task test

# Run specific test file
deno test lib/transform.test.ts --allow-env
deno test lib/deduplication.test.ts --allow-env

# Type check the code
deno task check
```

### Example Test

```typescript
import { assertEquals } from "jsr:@std/assert";
import { transformTempoWorklogToToggl } from "./lib/transform.ts";

Deno.test("transformation creates correct payload", () => {
  const worklog = { /* ... */ };
  const config = { workspace_id: 123, created_with: "test" };
  
  const result = transformTempoWorklogToToggl(worklog, config);
  
  assertEquals(result.workspace_id, 123);
  assertEquals(result.billable, true);
});
```

## 🔧 Configuration

All configuration is centralized in `config.ts`:

```typescript
export interface AppConfig {
  togglToken: string;
  tempoToken: string;
  togglWorkspaceId: number;
  togglProjectId?: number;
}
```

## 📊 Sync Results

The sync service returns detailed statistics:

```typescript
interface SyncResult {
  tempoEntriesFetched: number;      // Total entries from Tempo
  togglEntriesFetched: number;      // Total existing entries in Toggl
  uniqueEntries: number;            // New entries to sync
  duplicatesSkipped: number;        // Entries already in Toggl
  successfullyCreated: number;      // Successfully synced
  failedToCreate: number;           // Failed to sync
  errors: string[];                 // Error messages
}
```

## 🎯 Features

- ✅ **Date Validation**: Validates format, prevents future dates, ensures valid ranges
- ✅ **Duplicate Detection**: Automatically skips entries that already exist in Toggl
- ✅ **Batch Processing**: Syncs multiple entries in one operation
- ✅ **Error Handling**: Continues processing even if individual entries fail
- ✅ **Billable Status**: Preserves billable status from Tempo
- ✅ **Jira Integration**: Includes Jira issue links in descriptions
- ✅ **Type Safe**: Full TypeScript support
- ✅ **Testable**: Pure functions with comprehensive tests

## 📝 Best Practices

1. **Always test with a small date range first**
2. **Review the sync results before syncing large date ranges**
3. **Use environment variables for sensitive data**
4. **Run tests before deploying changes**
5. **Check for duplicates to avoid redundant API calls**

## 🐛 Troubleshooting

### "Missing environment variable" error
Ensure your `.env` file exists and contains all required variables.

### "Failed to fetch" errors
Check your API tokens are valid and not expired.

### Getting empty results even though Tempo has data
**Important:** The Toggl API has a limitation - it returns an empty array when `start_date` equals `end_date`. The application prevents this by requiring the end date to be at least 1 day after the start date. Always use a minimum 2-day range (e.g., 2025-10-01 to 2025-10-02).

### All entries showing as duplicates
The deduplication is based on start time. If you need to re-sync, delete the entries from Toggl first.

## 📄 License

MIT

