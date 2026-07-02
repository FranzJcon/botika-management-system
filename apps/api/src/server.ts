import "./config/load-env";

import { createApp } from "./app/app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Botika API running on port ${env.port}`);
});
