import express from "express";
import { createPortfolioRouter } from "api-feature";
import { disconnectFromDatabase, portfolioConfig } from "data-access";

const app = express();

app.use(express.json());
app.use("/api", createPortfolioRouter());

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({
    message: "Internal server error",
  });
});

const server = app.listen(portfolioConfig.PORT, () => {
  console.log(`Listening at http://localhost:${portfolioConfig.PORT}/api`);
});

server.on("error", console.error);

const shutdown = async () => {
  await disconnectFromDatabase();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
