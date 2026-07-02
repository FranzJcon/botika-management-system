import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";

import type { LoginInput } from "./auth.schemas";

export type SafeUser = {
  id: string;
  email: string;
  displayName: string;
  role: "ADMIN" | "STAFF";
};

type AuthResult =
  | {
      data: {
        token: string;
        user: SafeUser;
      };
      error?: never;
    }
  | {
      data?: never;
      error: "INVALID_CREDENTIALS";
    };

const toSafeUser = (user: SafeUser): SafeUser => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
});

const signToken = (userId: string) => {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign({ sub: userId }, env.jwtSecret, options);
};

export const login = async (input: LoginInput): Promise<AuthResult> => {
  const user = await prisma.user.findFirst({
    where: {
      email: input.email,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      displayName: true,
      role: true,
    },
  });

  if (!user) {
    return { error: "INVALID_CREDENTIALS" };
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    return { error: "INVALID_CREDENTIALS" };
  }

  return {
    data: {
      token: signToken(user.id),
      user: toSafeUser(user),
    },
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
    },
  });

  return user ? toSafeUser(user) : null;
};
