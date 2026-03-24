import mongoose from "mongoose";
import config from "../config/config.js";

let isConnected = false;

/* Opens a single shared MongoDB connection for the application. */
export async function connectToDatabase() {
  if (isConnected) {
    return mongoose.connection;
  }

  await mongoose.connect(config.MONGODB_URI, {
    dbName: config.MONGODB_DB_NAME
  });

  isConnected = true;
  return mongoose.connection;
}

/* Closes the MongoDB connection when the CLI run is finished. */
export async function disconnectFromDatabase() {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
}
