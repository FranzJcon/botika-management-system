import type { Request, Response } from "express";

import { getHealthStatus } from "./health.service";

export const getHealth = (_req: Request, res: Response) => {
  res.json(getHealthStatus());
};
