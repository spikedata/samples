const App = require("../App");
const configure = require("../lib/configure");
const output = require("../lib/output");

exports.command = async function (args) {
  try {
    await App.init(args);
    await configure.write();
  } catch (ex) {
    // this gets thrown by "read" which is used by userInput.question()
    if (ex.message === "canceled") {
      console.log(); // new-line to restore prompt
      process.exit(-1);
    }

    output.red("An unknown error halted the application. Try re-run with `--verbose`.");
    log.error("exception", ex);
  }
};
