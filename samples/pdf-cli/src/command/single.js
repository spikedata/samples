const Duration = require("duration");
const StatementsApi = require("@spike/api-statements");
const App = require("../App");
const output = require("../lib/output");
const pdfHelpers = require("../lib/pdfHelpers");

function fixArgs(args) {
  // if (!args.index) {
  //   args.index = path.join(args.folder, "folder.csv");
  // }
}

exports.command = async function (args) {
  try {
    fixArgs(args);
    await App.init(args);
    const res = await processSinglePdf(args);
    if (res) {
      output.green("success");
    } else {
      output.red("fail");
    }
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

async function processSinglePdf({ file, password, writeOutputJson, writeOutputCsv, quiet }) {
  const requestTime = new Date();
  const { token } = App.config();
  output.white("uploading", file, "...");
  const result = await requestPdf(token, file, password);
  const responseTime = new Date();
  // console.log("JSON", JSON.stringify(response, null, 2));

  // report success | fail
  if (!quiet) {
    if (result === undefined) {
      output.red("error: no response");
    } else if (result.type === StatementsApi.constants.TYPES.ERROR) {
      output.red("error:", result.code);
    } else {
      output.gray("success");
      // output.white(`${shortFilePath}: SUCCESS:`, result.data.parser, result.code)
    }
  }

  const duration = new Duration(requestTime, responseTime).toString();
  if (!quiet) {
    output.gray("Duration:", duration);
  }
  if (result) {
    if (writeOutputJson) {
      pdfHelpers.writeOutputJson(file, result);
    }
    if (writeOutputCsv && result.type == StatementsApi.constants.TYPES.SUCCESS) {
      pdfHelpers.writeOutputCsv(file, result.data);
    }
    return true;
  } else {
    return false;
  }
}

async function requestPdf(token, pdfPath, pass) {
  try {
    return await StatementsApi.pdf.request1(token, pdfPath, pass);
  } catch (e) {
    if (e instanceof StatementsApi.PdfTooLargeError) {
      output.red("Error: the pdf is too large:", pdfPath);
    } else if (e instanceof StatementsApi.InputValidationError) {
      output.red("Error: invalid inputs:", pdfPath, "\n ", e.validationErrors.join("\n "));
    } else {
      if (!e.response) {
        // net connection error (e.g. down, timeout) or > axios maxBodyLength limit
        // e : AxiosResponse
        output.red("Error: net connection error:", pdfPath + ":", e.code || e.message);
      } else {
        // http status error (e.g. 500 internal server error, 413 too big)
        // e : AxiosResponse
        output.red("Error: http status error:", pdfPath + ":", e.response.status, e.response.statusText);
      }
    }
    return undefined;
  }
}
