const path = require("path");
const express = require("express");
const pdf = require("./pdf");
const { TOKEN } = require("./config");

if (!TOKEN) {
  const x = path.join(__dirname, "config.js");
  console.error(`token missing in config, try run:\n code ${x}`);
  process.exit(-1);
}

// config
const _port = 5000;
const _root = path.join(__dirname, "public");
const _url = "http://localhost:" + _port;
const _sizeLimit = "10mb";

let server;

function start() {
  const app = express();
  app.use(express.json({ limit: _sizeLimit }));
  app.use("/", express.static(_root));
  app.post("/pdf", pdf);
  server = app.listen(_port, () => console.log(`listening: ${_url}`));
}

function stop() {
  server.close();
}

function run() {
  start();
}

run();
