import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { prisma } from "../lib/prisma";

type AuthTokenPayload = {
  sub: string;
};

const unauthorized = (res: Response) =>
  res.status(401).json({
    message: "Unauthorized",
  });

const getBearerToken = (req: Request) => {
  const authorization = req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = getBearerToken(req);

  if (!token) {
    return unauthorized(res);
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;

    if (!payload.sub) {
      return unauthorized(res);
    }

    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
      },
    });

    if (!user) {
      return unauthorized(res);
    }

    req.user = user;
    return next();
  } catch {
    return unauthorized(res);
  }
};
