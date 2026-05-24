import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";
import {
  ensureDefaultAdmin,
  ensureDefaultCurrencyPairConfigs,
} from "./services/bootstrapService.js";
import { ensureUploadDir } from "./utils/uploadDir.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ensureUploadDir();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

connectDatabase()
  .then(async () => {
    await ensureDefaultAdmin();
    await ensureDefaultCurrencyPairConfigs();
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });
