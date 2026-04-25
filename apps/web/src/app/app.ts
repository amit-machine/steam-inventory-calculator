import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import type { AccountSummary, PortfolioHistoryEntry, PortfolioSummaryResponse } from 'api-contracts';
import appStyles from './app.css';
import appTemplate from './app.html';
import { PortfolioApiService } from './portfolio-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: appTemplate,
  styles: [appStyles],
})
export class App implements OnInit {
  private readonly portfolioApi = inject(PortfolioApiService);

  protected readonly summary = signal<PortfolioSummaryResponse | null>(null);
  protected readonly historyEntries = signal<PortfolioHistoryEntry[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isRecalculating = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  async ngOnInit() {
    await this.loadDashboard();
  }

  protected async recalculatePortfolio() {
    this.isRecalculating.set(true);
    this.errorMessage.set(null);

    try {
      const summary = await this.portfolioApi.recalculatePortfolio();
      const history = await this.portfolioApi.getPortfolioHistory();

      this.summary.set(summary);
      this.historyEntries.set(history.entries);
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error));
    } finally {
      this.isRecalculating.set(false);
    }
  }

  protected trackAccount(_index: number, account: AccountSummary) {
    return account.account;
  }

  protected getSummaryStatusText() {
    if (this.isLoading()) {
      return 'Loading portfolio data...';
    }

    if (this.summary()) {
      return 'Latest summary loaded from the API snapshot.';
    }

    return 'No saved summary yet. Run a recalculation to create one.';
  }

  private async loadDashboard() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [summary, history] = await Promise.all([
        this.portfolioApi.getPortfolioSummary(),
        this.portfolioApi.getPortfolioHistory(),
      ]);

      this.summary.set(summary);
      this.historyEntries.set(history.entries);
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Something went wrong while talking to the portfolio API.';
  }
}
