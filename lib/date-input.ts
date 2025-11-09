/**
 * Date input and validation utilities
 * Handles interactive date prompting and validation
 */

/**
 * Prompts the user for input and returns the response
 * @param message - The prompt message to display
 * @returns User's input trimmed
 */
export async function promptForDate(message: string): Promise<string> {
  // Write prompt to stdout
  const encoder = new TextEncoder();
  await Deno.stdout.write(encoder.encode(message));

  // Read from stdin
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);

  if (n === null) {
    throw new Error("Failed to read input");
  }

  const decoder = new TextDecoder();
  return decoder.decode(buf.subarray(0, n)).trim();
}

/**
 * Validates if a string matches the YYYY-MM-DD format
 * @param date - Date string to validate
 * @returns true if format is valid
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}

/**
 * Validates if a date string represents a valid calendar date
 * @param date - Date string in YYYY-MM-DD format
 * @returns true if date is valid
 */
export function isValidDate(date: string): boolean {
  if (!isValidDateFormat(date)) {
    return false;
  }

  const parsedDate = new Date(date + "T00:00:00");

  // Check if date is valid by comparing the parsed components
  const [year, month, day] = date.split("-").map(Number);
  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
}

/**
 * Checks if a date is in the future
 * @param date - Date string in YYYY-MM-DD format
 * @returns true if date is in the future
 */
export function isDateInFuture(date: string): boolean {
  const inputDate = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate > today;
}

/**
 * Validates if the date range is valid (start < end)
 * Note: Toggl API requires end_date to be after start_date (not equal)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns true if range is valid (end date is after start date)
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  // Toggl API returns empty array if start_date === end_date
  // So we require end_date to be strictly after start_date
  return start < end;
}

/**
 * Prompts for a date with validation and retry logic
 * @param message - Prompt message
 * @param allowFuture - Whether to allow future dates (default: false)
 * @returns Valid date string
 */
export async function promptForValidDate(
  message: string,
  allowFuture = false,
): Promise<string> {
  while (true) {
    const date = await promptForDate(message);

    if (!isValidDateFormat(date)) {
      console.log(
        "❌ Invalid format. Please use YYYY-MM-DD (e.g., 2025-10-20)",
      );
      continue;
    }

    if (!isValidDate(date)) {
      console.log("❌ Invalid date. Please enter a valid calendar date");
      continue;
    }

    if (!allowFuture && isDateInFuture(date)) {
      console.log(
        "❌ Date cannot be in the future. Please enter today or a past date",
      );
      continue;
    }

    console.log("✓ Valid date");
    return date;
  }
}

/**
 * Prompts for a date range with validation
 * @returns Object with startDate and endDate
 */
export async function promptForDateRange(): Promise<{
  startDate: string;
  endDate: string;
}> {
  console.log(
    "ℹ️  Note: End date must be at least 1 day after start date (Toggl API limitation)\n",
  );

  const startDate = await promptForValidDate(
    "📅 Enter start date (YYYY-MM-DD): ",
  );

  while (true) {
    const endDate = await promptForValidDate(
      "📅 Enter end date (YYYY-MM-DD): ",
    );

    if (startDate === endDate) {
      console.log("❌ End date must be different from start date");
      console.log("   (Toggl API returns empty results when dates are equal)");
      console.log(
        "   💡 Tip: Use at least a 2-day range, e.g., if start is 2025-10-01, end should be 2025-10-02 or later",
      );
      continue;
    }

    if (!isValidDateRange(startDate, endDate)) {
      console.log("❌ End date must be after the start date");
      continue;
    }

    console.log("✓ Valid date range\n");
    return { startDate, endDate };
  }
}
