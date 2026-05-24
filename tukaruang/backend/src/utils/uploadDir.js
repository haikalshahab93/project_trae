import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDir = path.resolve(__dirname, "../../uploads");

export const ensureUploadDir = () => {
  fs.mkdirSync(uploadDir, { recursive: true });
};
