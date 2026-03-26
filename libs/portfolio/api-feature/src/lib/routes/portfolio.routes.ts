import { Router } from "express";
import { fetchPortfolioHistory, getHealthStatus, recalculatePortfolio } from "../services/portfolio-api.service";

/* Registers the initial REST routes for the portfolio API. */
export function createPortfolioRouter() {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json(getHealthStatus());
  });

  router.get("/portfolio/history", async (req, res, next) => {
    try {
      const limit = Number(req.query["limit"]) || 100;
      const history = await fetchPortfolioHistory(limit);
      res.json(history);
    } catch (error) {
      next(error);
    }
  });

  router.get("/portfolio/summary", async (_req, res, next) => {
    try {
      const summary = await recalculatePortfolio();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  router.post("/portfolio/recalculate", async (_req, res, next) => {
    try {
      const summary = await recalculatePortfolio();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
