import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { PortfolioHistoryResponse, PortfolioSummaryResponse } from 'api-contracts';
import { firstValueFrom } from 'rxjs';

/* Builds the local API base URL so the frontend follows the current browser hostname. */
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3333/api';
  }

  return `${window.location.protocol}//${window.location.hostname || 'localhost'}:3333/api`;
};

@Injectable({
  providedIn: 'root',
})
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = getApiBaseUrl();

  async getPortfolioSummary(): Promise<PortfolioSummaryResponse | null> {
    try {
      return await firstValueFrom(
        this.http.get<PortfolioSummaryResponse>(`${this.apiBaseUrl}/portfolio/summary`)
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return null;
      }

      throw error;
    }
  }

  async recalculatePortfolio(): Promise<PortfolioSummaryResponse> {
    return firstValueFrom(
      this.http.post<PortfolioSummaryResponse>(`${this.apiBaseUrl}/portfolio/recalculate`, {})
    );
  }

  async getPortfolioHistory(limit = 12): Promise<PortfolioHistoryResponse> {
    return firstValueFrom(
      this.http.get<PortfolioHistoryResponse>(`${this.apiBaseUrl}/portfolio/history`, {
        params: {
          limit: String(limit),
        },
      })
    );
  }
}
