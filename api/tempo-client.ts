/**
 * Tempo API client
 * Handles all HTTP communication with the Tempo API
 */

import { TempoWorklog } from "../types.ts";

export interface TempoApiResponse {
  results: TempoWorklog[];
  metadata?: {
    count: number;
    offset: number;
    limit: number;
  };
}

export interface TempoClientConfig {
  apiToken: string;
  jiraEmail?: string;
  jiraApiToken?: string;
  baseUrl?: string;
}

/**
 * Tempo API Client
 */
export class TempoClient {
  private readonly apiToken: string;
  private readonly baseUrl: string;
  private readonly jiraEmail?: string;
  private readonly jiraApiToken?: string;
  constructor(config: TempoClientConfig) {
    this.apiToken = config.apiToken;
    this.baseUrl = config.baseUrl || "https://api.tempo.io/4";
    this.jiraEmail = config.jiraEmail;
    this.jiraApiToken = config.jiraApiToken;
  }

  /**
   * Fetches worklogs within a date range
   * @param fromDate - Start date (YYYY-MM-DD)
   * @param toDate - End date (YYYY-MM-DD)
   * @returns Array of worklogs
   */
  async fetchWorklogs(
    fromDate: string,
    toDate: string,
  ): Promise<TempoWorklog[]> {
    const url = `${this.baseUrl}/worklogs?from=${fromDate}&to=${toDate}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${this.apiToken}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to fetch Tempo worklogs: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    const data: TempoApiResponse = await response.json();
    return data.results || [];
  }

  /**
   * Fetches Jira issue details from the issue self URL
   * @param issueSelfUrl - The Jira issue self URL (e.g., "https://sofresh-it.atlassian.net/rest/api/2/issue/129731")
   * @returns Issue details with key and summary
   */
  async fetchJiraIssue(
    issueSelfUrl: string,
  ): Promise<{ key: string; summary: string }> {
    // Use Basic Auth for Jira API if credentials are provided
    const headers: HeadersInit = {
      "Accept": "application/json",
    };

    if (this.jiraEmail && this.jiraApiToken) {
      // Basic Auth: base64 encode "email:apiToken"
      const credentials = btoa(`${this.jiraEmail}:${this.jiraApiToken}`);
      headers["Authorization"] = `Basic ${credentials}`;
    } else {
      // Fallback to Bearer token (won't work but keeps backward compatibility)
      headers["Authorization"] = `Bearer ${this.apiToken}`;
    }

    const response = await fetch(issueSelfUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `❌ Failed to fetch Jira issue ${issueSelfUrl}: ${response.status} ${response.statusText}`,
      );
      throw new Error(
        `Failed to fetch Jira issue: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    const data = await response.json();
    const result = {
      key: data.key || "",
      summary: data.fields?.summary || "",
    };

    return result;
  }

  /**
   * Enriches worklogs with Jira issue details (key and summary)
   * Fetches issue details for unique issues in parallel
   * @param worklogs - Array of worklogs to enrich
   * @returns Array of enriched worklogs
   */
  async enrichWorklogsWithIssueDetails(
    worklogs: TempoWorklog[],
  ): Promise<TempoWorklog[]> {
    // Get unique issue URLs
    const uniqueIssueUrls = new Set<string>();
    worklogs.forEach((worklog) => {
      if (worklog.issue?.self) {
        uniqueIssueUrls.add(worklog.issue.self);
      }
    });

    console.log(
      `\n📋 Enriching ${worklogs.length} worklogs with ${uniqueIssueUrls.size} unique Jira issues...`,
    );

    // Fetch all unique issues in parallel
    const issueDetailsMap = new Map<string, { key: string; summary: string }>();
    const fetchPromises = Array.from(uniqueIssueUrls).map(async (url) => {
      try {
        const details = await this.fetchJiraIssue(url);
        issueDetailsMap.set(url, details);
      } catch (error) {
        console.warn(`⚠️  Failed to fetch issue details for ${url}:`, error);
        // Continue with empty details if fetch fails
        issueDetailsMap.set(url, { key: "", summary: "" });
      }
    });

    await Promise.all(fetchPromises);

    console.log(
      `✓ Enrichment complete. Fetched details for ${issueDetailsMap.size} issues.\n`,
    );

    // Enrich worklogs with issue details
    return worklogs.map((worklog) => {
      if (worklog.issue?.self && issueDetailsMap.has(worklog.issue.self)) {
        const details = issueDetailsMap.get(worklog.issue.self)!;
        return {
          ...worklog,
          issue: {
            ...worklog.issue,
            key: details.key,
            summary: details.summary,
          },
        };
      }
      return worklog;
    });
  }
}
