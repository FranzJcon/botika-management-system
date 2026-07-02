import cors from "cors";
import express from "express";

import { registerSwaggerDocs } from "../docs/swagger";
import { router } from "./router";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  registerSwaggerDocs(app);

  app.use(router);

  app.use((_req, res) => {
    res.status(404).json({
      message: "Route not found",
    });
  });

  return app;
};
