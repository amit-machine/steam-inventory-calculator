import mongoose from "mongoose";
import { portfolioConfig } from "../config";

let isConnected = false;

/* Opens a single shared MongoDB connection for the application. */
export async function connectToDatabase() {
  if (isConnected) {
    return mongoose.connection;
  }

  await mongoose.connect(portfolioConfig.MONGODB_URI, {
    dbName: portfolioConfig.MONGODB_DB_NAME,
  });

  isConnected = true;
  return mongoose.connection;
}

/* Closes the MongoDB connection when the API process is shutting down. */
export async function disconnectFromDatabase() {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
}
