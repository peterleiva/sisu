import { start, stop, cleanup } from "~/database";
import { MongoMemoryServer } from "mongodb-memory-server";
import { type Connection } from "mongoose";

export default function databaseSetup(runCleanup = true) {
  const server = new MongoMemoryServer({
    instance: {},
    binary: {
      checkMD5: true,
    },
  });

  let db: Connection;

  beforeAll(async () => {
    await server.start();

    const url = server.getUri();
    db = await start({ url });
  });

  if (runCleanup) {
    beforeEach(() => cleanup(db));
  }

  afterAll(async () => {
    if (db) await stop(db);
    await server.stop(true);
  });
}
