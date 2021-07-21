const fs = require("fs");
if (process.argv.length !== 4) {
  console.error("wrong num args: expected 4 got", process.argv.length);
  process.exit(-1);
}
const requestId = process.argv[2];
const jsonPath = process.argv[3];
const json = JSON.parse(fs.readFileSync(jsonPath));
if (!json.requestId) {
  console.error("does not have .requestId");
  process.exit(-2);
}
json.requestId = requestId;
fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
