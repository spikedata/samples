const fs = require("fs");
const os = require("os");
const path = require("path");
const jwtHelper = require("./jwtHelper");
const output = require("./output");
const userInput = require("./userInput");

function getConfigPath() {
  const home = os.homedir();
  const dir = path.join(home, ".spike");
  const configPath = path.join(dir, "config.json");
  return { dir, configPath };
}

// let jwksUri = "http://127.0.0.1:8080/jwks.json"
let jwksUri = "https://app.spikedata.co.za/.well-known/jwks.json";

exports.init = function (config, inputs) {
  jwksUri = inputs.jwksUri || config.jwksUri;
};

exports.read = async function () {
  const cp = getConfigPath();
  let token;
  if (!fs.existsSync(cp.configPath)) {
    ({ token } = await exports.write());
  } else {
    ({ token } = JSON.parse(fs.readFileSync(cp.configPath, "utf8")));
  }

  return { token };
};

exports.write = async function () {
  const cp = getConfigPath();

  // first run check
  if (!fs.existsSync(cp.configPath)) {
    console.log("First run detected, creating config file...");
    if (!fs.existsSync(cp.dir)) {
      fs.mkdirSync(cp.dir);
    }
  }

  // please enter token
  let token;
  while (true) {
    token = await userInput.question("Enter your token: ", false, undefined, undefined);
    if (await validateToken(token)) {
      break;
    } else {
      output.red("Invalid token entered, please try again (Ctrl-c to exit)");
    }
  }

  const settings = { token };
  fs.writeFileSync(cp.configPath, JSON.stringify(settings, null, 2), "utf8");
  console.log("wrote config file:", cp.configPath);
  return settings;
};

async function validateToken(token) {
  output.gray("validating token ...");
  const decoded = await jwtHelper.verify(token, jwksUri);
  return !!decoded;
}
