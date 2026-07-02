import path from "node:path";

import { config } from "dotenv";

config();
config({
  path: path.resolve(__dirname, "../../../../packages/database/.env"),
});
