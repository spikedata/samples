import { readFileSync } from "fs";
import { resolve } from "path";
import { pdf, constants } from "@spike/api-statements";

const args = {
  tokenPath: process.argv[2],
  pdfPath: process.argv[3],
  pdfPassword: process.argv[4] === "local" ? undefined : process.argv[4],
  local: process.argv[4] === "local" || process.argv[5] === "local",
};

if (!args.tokenPath || !args.pdfPath) {
  console.error("Usage: node app.mjs <path-to-token-file> <path-to-pdf-file> [pdf-password]");
  process.exit(1);
}

if (args.local) {
  constants.changeServer("http://localhost:8000");
}

// inputs
const TOKEN = readFileSync(args.tokenPath, "utf8").trim();
const FILE = resolve(args.pdfPath);
const PASS = args.pdfPassword || undefined;

// make request
const spikeResponse = await pdf.request2(TOKEN, FILE, PASS);

// print response
console.log(JSON.stringify(spikeResponse, null, 2));
