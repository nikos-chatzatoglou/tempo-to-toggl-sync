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
  baseUrl?: string;
}

/**
 * Tempo API Client
 * All API interactions are encapsulated in this class for easy testing and mocking
 */
export class TempoClient {
  private readonly apiToken: string;
  private readonly baseUrl: string;

  constructor(config: TempoClientConfig) {
    this.apiToken = config.apiToken;
    this.baseUrl = config.baseUrl || "https://api.tempo.io/4";
  }

  /**
   * Fetches worklogs within a date range
   * @param fromDate - Start date (YYYY-MM-DD)
   * @param toDate - End date (YYYY-MM-DD)
   * @returns Array of worklogs
   */
  async fetchWorklogs(fromDate: string, toDate: string): Promise<TempoWorklog[]> {
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
        `Failed to fetch Tempo worklogs: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    const data: TempoApiResponse = await response.json();
    return data.results || [];
  }
}

