import dotenv from "dotenv";
import { env } from "node-environment";

const { error } = dotenv.config();

if (!env("prod", "staging") && error) {
  console.warn(error);
}

const getEnvOrThrow = (name: string, env?: string): string => {
  if (!env) {
    throw new Error(`Must define ${name} variable`);
  }

  return env;
};

const { PORT: port, DATABASE_URL: database } = process.env;

export default {
  env,
  port,
  database,
};
