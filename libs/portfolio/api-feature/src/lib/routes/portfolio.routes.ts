import { Router } from "express";
import {
  fetchPortfolioHistory,
  fetchPortfolioSummary,
  getHealthStatus,
  recalculatePortfolio,
} from "../services/portfolio-api.service";

const DEFAULT_HISTORY_LIMIT = 100;
const MAX_HISTORY_LIMIT = 500;

interface PortfolioRouteHandlers {
  fetchPortfolioHistory(limit?: number): Promise<unknown>;
  fetchPortfolioSummary(): Promise<unknown | null>;
  getHealthStatus(): unknown;
  recalculatePortfolio(): Promise<unknown>;
}

/* Validates the history limit query parameter and returns a safe bounded value. */
export function parseHistoryLimit(limitValue: unknown) {
  if (limitValue === undefined) {
    return {
      limit: DEFAULT_HISTORY_LIMIT,
    };
  }

  const normalizedValue = Array.isArray(limitValue) ? limitValue[0] : limitValue;
  const limit = Number(normalizedValue);

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_HISTORY_LIMIT) {
    return {
      error: `limit must be an integer between 1 and ${MAX_HISTORY_LIMIT}`,
    };
  }

  return {
    limit,
  };
}

/* Registers the initial REST routes for the portfolio API. */
export function createPortfolioRouter(handlers: PortfolioRouteHandlers = {
  fetchPortfolioHistory,
  fetchPortfolioSummary,
  getHealthStatus,
  recalculatePortfolio,
}) {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json(handlers.getHealthStatus());
  });

  router.get("/portfolio/history", async (req, res, next) => {
    try {
      const parsedLimit = parseHistoryLimit(req.query["limit"]);

      if ("error" in parsedLimit) {
        res.status(400).json({
          message: parsedLimit.error,
        });
        return;
      }

      const history = await handlers.fetchPortfolioHistory(parsedLimit.limit);
      res.json(history);
    } catch (error) {
      next(error);
    }
  });

  router.get("/portfolio/summary", async (_req, res, next) => {
    try {
      const summary = await handlers.fetchPortfolioSummary();

      if (!summary) {
        res.status(404).json({
          message: "No portfolio summary exists yet. Run a recalculation first.",
        });
        return;
      }

      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  router.post("/portfolio/recalculate", async (_req, res, next) => {
    try {
      const summary = await handlers.recalculatePortfolio();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
