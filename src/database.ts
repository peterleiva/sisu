import mongoose, { ClientSession, type Connection } from "mongoose";
import config from "./env";

export type DatabaseOptions = Partial<{
  url: string;
  log: boolean;
}>;

const isProd = config.env("production", "staging");
const DEV_URI_FALLBACK = "mongodb://localhost/sisu";

export async function start({
  url = config.database,
  log = true,
}: DatabaseOptions = {}): Promise<Connection> {
  if (isProd && !url) {
    throw "Database not set. Please, set environment variable DATABASE_URL";
  }

  const { connection } = await mongoose.connect(url ?? DEV_URI_FALLBACK, {
    appName: "peter.dev.br/core",
    wtimeoutMS: isProd ? 25_000 : 0,
    socketTimeoutMS: 30_000 * 3,
    maxPoolSize: 200,
    keepAlive: true,
    keepAliveInitialDelay: 300_000,
    serverSelectionTimeoutMS: isProd ? 45_000 : 7_000,
  });

  if (log) {
    connection.on("connected", function (this: Connection) {
      const { host, port, name: db } = this;
      const connectionUri = `mongodb://${host}:${port}/${db}`;
      console.info(`👾 database connected at ${connectionUri}`);
    });

    connection.on("disconnected", () => {
      console.info("❌ Database lost connection");
    });
  }

  return connection;
}

export async function stop(db: Connection) {
  await db.close();
}

export async function cleanup(db: Connection) {
  try {
    await Promise.all(
      Object.keys(db.collections).map((collection) =>
        db.collection(collection).deleteMany({})
      )
    );
  } catch (error) {
    console.error("can't clean database 👉 ", error);
  }
}

export async function withTransaction(
  callback: (session?: ClientSession) => Promise<void>
) {
  const session = await mongoose.startSession();

  await callback(session);
  await session.endSession();
}
