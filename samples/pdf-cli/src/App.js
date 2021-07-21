const Config = require("./config/index");
const Configure = require("./lib/configure");
const basicColoredLogger = require("./lib/log/basicColoredLogger");
const noLogger = require("./lib/log/noLogger");
const { output } = require("./lib/output");

global.log = console;

exports.ErrorCode = {
  Success: 0,
  Exception: 1,
  ProcessPdfFailed: 2, // one or more pdfs failed
};

exports.state = {
  initialized: false,
  config: {},
  args: {},
  errorCode: exports.ErrorCode.Success,
};

function resetState() {
  exports.state = {
    initialized: false,
    config: {},
    args: {},
    errorCode: exports.ErrorCode.Success,
  };
}

async function initGlobals(config, args) {
  if (args.verbose) {
    basicColoredLogger.init(config.logger, args);
    global.log = basicColoredLogger;
  } else {
    noLogger.init(config.logger, args);
    global.log = noLogger;
  }
}

async function initDeps(config, args) {}

async function initSelf(config, args) {
  Configure.init(config, args);
  const spikeConfigFile = await Configure.read();
  if (!spikeConfigFile.token) {
    const x = process.argv[0] + " " + process.argv[1];
    output.red(`token missing in config, try run:\n ${x} configure`);
    process.exit(-1);
  }
  exports.state.config.token = spikeConfigFile.token;
}

exports.setErrorCode = function (e) {
  exports.state.errorCode = e;
};

exports.getErrorCode = function () {
  return exports.state.errorCode;
};

exports.config = function () {
  return exports.state.config;
};

exports.init = async function (args) {
  if (exports.state.initialized) {
    output.red("initialization error: already initialized");
    process.exit(-1);
  }
  const config = Config[args.config];
  exports.state.config = config;
  exports.state.args = args;

  try {
    await initGlobals(config, args);
    if (args.subcommand === "configure") {
      return true; // don't SpikeConfig.read() otherwise we will setup the config file twice
    }
    await initDeps(config, args);
    await initSelf(config, args);
    exports.state.initialized = true;
  } catch (err) {
    output.red("initialization error:", err);
    process.exit(-1);
  }
};

exports.shutdown = async function () {
  exports.state.initialized = false;
  if (!exports.state.config.quiet) {
    if (global.log) {
      global.log.info("app shutdown");
    } else {
      console.log("app shutdown");
    }
  }
  global.log.shutdown();
  global.log = undefined;
  resetState();
};
