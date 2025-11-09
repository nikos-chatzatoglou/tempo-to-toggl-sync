/**
 * Main application entry point
 * Synchronizes time entries from Tempo to Toggl
 */

import { load } from "@std/dotenv";
import { loadConfig } from "./config.ts";
import { TempoClient } from "./api/tempo-client.ts";
import { TogglClient } from "./api/toggl-client.ts";
import { SyncService } from "./services/sync-service.ts";
import { promptForDateRange } from "./lib/date-input.ts";

// Load environment variables
await load({ export: true });

/**
 * Main execution function
 */
async function main() {
  try {
    // Welcome message
    console.log("\n🎯 Welcome to Tempo → Toggl Sync!\n");

    // Interactive date input
    const { startDate: fromDate, endDate: toDate } = await promptForDateRange();

    console.log(`🔄 Starting sync from ${fromDate} to ${toDate}...\n`);

    // Load configuration
    console.log("⚙️  Loading configuration...");
    const config = loadConfig();
    console.log("✓ Configuration loaded");
    console.log(
      `  Workspace ID: ${config.togglWorkspaceId} (type: ${typeof config
        .togglWorkspaceId})`,
    );

    // Initialize API clients
    console.log("🔧 Initializing API clients...");
    const tempoClient = new TempoClient({
      apiToken: config.tempoToken,
      jiraEmail: config.jiraEmail,
      jiraApiToken: config.jiraApiToken,
    });
    const togglClient = new TogglClient({ apiToken: config.togglToken });
    console.log("✓ API clients ready\n");

    // Initialize sync service
    const syncService = new SyncService({
      tempoClient,
      togglClient,
      transformConfig: {
        workspace_id: config.togglWorkspaceId,
        project_id: config.togglProjectId,
        created_with: "tempo-to-toggl-sync",
      },
    });

    // Execute synchronization with progress messages
    console.log("🔍 Fetching Tempo worklogs...");
    const result = await syncService.syncTimeEntries(fromDate, toDate);

    console.log(`✓ Found ${result.tempoEntriesFetched} Tempo entries`);
    console.log(`✓ Found ${result.togglEntriesFetched} existing Toggl entries`);

    if (result.uniqueEntries > 0) {
      console.log(`\n⚡ Processing ${result.uniqueEntries} unique entries...`);
      console.log(`🔎 Skipped ${result.duplicatesSkipped} duplicate(s)`);
      console.log(`🚀 Creating entries in Toggl...\n`);
    }

    // Display results
    console.log("\n📊 Sync Results:");
    console.log("═".repeat(50));
    console.log(`  📥 Tempo entries fetched:    ${result.tempoEntriesFetched}`);
    console.log(`  📤 Toggl entries fetched:    ${result.togglEntriesFetched}`);
    console.log(`  ✨ Unique entries to sync:   ${result.uniqueEntries}`);
    console.log(`  ⏭️  Duplicates skipped:       ${result.duplicatesSkipped}`);
    console.log(`  ✅ Successfully created:     ${result.successfullyCreated}`);
    console.log(`  ❌ Failed to create:         ${result.failedToCreate}`);
    console.log("═".repeat(50));

    if (result.errors.length > 0) {
      console.log("\n💥 Errors encountered:");
      result.errors.forEach((error) => console.log(`  ⚠️  ${error}`));
    }

    if (result.successfullyCreated > 0) {
      console.log(
        `\n🎊 Successfully synced ${result.successfullyCreated} entries! 🎉`,
      );
    } else if (result.duplicatesSkipped > 0) {
      console.log(
        "\n✓ All entries already exist in Toggl. Nothing to sync. 👍",
      );
    } else {
      console.log("\n⚠️  No entries found to sync.");
    }
  } catch (error) {
    console.error(
      "\n❌ Fatal error:",
      error instanceof Error ? error.message : error,
    );
    Deno.exit(1);
  }
}

// Run the application
if (import.meta.main) {
  await main();
}
