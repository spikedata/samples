import { join } from "path";
import { pdf } from "@spike/api-statements";

const _dirname = typeof __dirname !== "undefined" ? __dirname : import.meta.url.substr(7).replace(/[\\/][^\\/]*$/, "");

// inputs
const TOKEN = "..TODO.."; // TODO: enter your token here
const FILE = join(_dirname, "../data/encrypted.pdf");
const PASS = "1147495866";

// make request
const spikeResponse = await pdf.request2Test(TOKEN, FILE, PASS);

// print response
console.log(JSON.stringify(spikeResponse, null, 2));
