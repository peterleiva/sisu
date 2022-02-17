#!/usr/bin/env ts-node

import { constants, accessSync } from "fs";
import createParser from "./parser-nota-corte";
import "./env";
import { start, stop } from "./database";
import { Presets, SingleBar } from "cli-progress";

if (process.argv.length > 3) {
  console.error(`usage: ${process.argv[1]} [csv-file]`);
  process.exit(1);
}

const csvFile = process.argv[2] ?? process.env.CSV_FILE;
if (!csvFile) {
  console.error("no csv file defined. Mut define in $CSV_FILE or as argument");
  process.exit(1);
}
console.info("reading %s...", csvFile);

async function main() {
  try {
    accessSync(csvFile, constants.R_OK);
  } catch (error) {
    console.error("can't read the file: %s -> ", csvFile);
    throw error;
  }

  const db = await start({ log: false });

  const progress = new SingleBar({}, Presets.shades_classic);
  progress.start(0, 0);

  const stream = createParser(csvFile, ({ current, total }) => {
    progress.setTotal(total);
    progress.update(current);
    progress.updateETA();
  });

  stream.on("close", async () => {
    progress.stop();
    await stop(db);
  });
}

main();
