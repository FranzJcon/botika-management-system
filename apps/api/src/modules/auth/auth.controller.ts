import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../../config/env";

import { getCurrentUser, login } from "./auth.service";
import { loginSchema } from "./auth.schemas";

const validationFailed = (res: Response) =>
  res.status(400).json({
    message: "Validation failed",
  });

const unauthorized = (res: Response) =>
  res.status(401).json({
    message: "Invalid credentials",
  });

const getBearerToken = (req: Request) => {
  const authorization = req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
};

export const loginHandler = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return validationFailed(res);
  }

  const auth = await login(result.data);

  if (auth.error) {
    return unauthorized(res);
  }

  return res.json(auth.data);
};

export const meHandler = async (req: Request, res: Response) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub?: string };

    if (!payload.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getCurrentUser(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json(user);
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
