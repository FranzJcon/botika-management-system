import cors from "cors";
import express from "express";

import { router } from "./router";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(router);

  app.use((_req, res) => {
    res.status(404).json({
      message: "Route not found",
    });
  });

  return app;
};
