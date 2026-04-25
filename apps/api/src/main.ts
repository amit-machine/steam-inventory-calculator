import express from "express";
import { createPortfolioRouter } from "api-feature";
import { connectToDatabase, disconnectFromDatabase, portfolioConfig } from "data-access";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());
app.use("/api", createPortfolioRouter());

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({
    message: "Internal server error",
  });
});

async function bootstrap() {
  await connectToDatabase();

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
}

bootstrap().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
