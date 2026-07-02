const DEFAULT_PORT = 3000;

const parsePort = (value: string | undefined) => {
  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
};

export const env = {
  port: parsePort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtSecret: process.env.JWT_SECRET ?? "botika-development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
};
