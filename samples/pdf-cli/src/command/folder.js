const fs = require("fs");
const path = require("path");
const Async = require("async");
const minimatch = require("minimatch");
const Duration = require("duration");
const StatementsApi = require("@spike/api-statements");
const App = require("../App");
const Csv = require("../lib/csv");
const output = require("../lib/output");
const pdfHelpers = require("../lib/pdfHelpers");
const userInput = require("../lib/userInput");

const FilterTypes = {
  all: {
    option: 1,
    text: "all",
  },
  "new-only": {
    option: 2,
    text: "new files only",
  },
  "new-and-prev-errors": {
    option: 3,
    text: "new + prev errors",
  },
  "by-id": {
    option: 4,
    text: "ids from grid above (comma separated)",
  },
  pattern: {
    option: 5,
    text: "filename matching a pattern",
  },
  none: {
    option: 6,
    text: "none = quit",
  },
};
exports.FilterTypes = FilterTypes;

const optionToFilterType = Object.keys(FilterTypes).reduce((prev, cur) => {
  const filterType = FilterTypes[cur];
  // prev[filterType.option] = filterType;
  prev[filterType.option] = cur;
  return prev;
}, {});
const filterTypesMenu = Object.keys(FilterTypes).reduce((prev, cur) => {
  const filterType = FilterTypes[cur];
  return `${prev}\n${filterType.option}. ${filterType.text}`;
}, "");

function fixArgs(args) {
  if (!args.index) {
    args.index = path.join(args.folder, "folder.csv");
  }
  if (args.filterPath) {
    args.filterPath = new RegExp(args.filterPath);
  }
}

exports.command = async function (args) {
  try {
    fixArgs(args);
    await App.init(args);

    // read prevIndex
    let prevIndex;
    if (fs.existsSync(args.index)) {
      const csv = Csv.readCsv(args.index);
      prevIndex = arrayToObject(csv, "file");
    }

    const found = await findPdfs(args, prevIndex);

    // early out
    if (args.dryRun) {
      return;
    }

    const filtered = await filterPdfs(args, found);
    if (!filtered || filtered.length === 0) {
      output.white("No files to process, exiting ...");
      process.exit(0);
    }

    const { start, end, results } = await processAll(args, filtered);

    // index
    if (args.writeIndex) {
      writeIndex(args, results, prevIndex);
    }

    // summary
    writeSummary(found.length, results, start, end);
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

function arrayToObject(array, key, deleteKey = false) {
  return array.reduce((obj, item) => {
    obj[item[key]] = item;
    if (deleteKey) {
      delete item[key];
    }
    return obj;
  }, {});
}

async function findPdfs(args, prevIndex) {
  let filePaths = await pdfHelpers.find(args.folder, args.filterPath);
  output.green("----------------------------------------------------------------");
  output.green("Pdfs found:");
  output.green("----------------------------------------------------------------");
  if (args.max > 0) {
    filePaths = filePaths.slice(0, args.max);
  }

  const { categorized, counts } = categorize(args, filePaths, prevIndex);

  // print with state = new, prev-error, prev-success
  console.table(categorized.map((x) => ({ path: x.short, state: x.state })));
  console.table(counts);

  return categorized;
}

const Category = {
  new: "new",
  prevSuccess: "prev-success",
  prevError: "prev-error",
};

function categorize(args, filePaths, prevIndex) {
  const counts = {
    new: 0,
    prevSuccess: 0,
    prevError: 0,
  };
  const categorized = filePaths.map((filePath) => {
    // print with state = new, prev-error, prev-success
    const short = shorten(filePath, args.folder);
    const prev = prevIndex && prevIndex[short];
    let state;
    if (prev) {
      if (prev.type == StatementsApi.constants.TYPES.SUCCESS) {
        state = "prev-success";
        counts.prevSuccess++;
      } else {
        state = "prev-error";
        counts.prevError++;
      }
    } else {
      state = "new";
      counts.new++;
    }
    return { filePath, short, prev, state }; // found
  });

  return { categorized, counts };
}

async function filterPdfs(args, found) {
  let filterType;
  if (args.filterType) {
    // filterType was specified on the commandline
    filterType = args.filterType;
  } else {
    // let user pick the filter type
    output.green();
    output.green("--------------------------------");
    output.green("Which pdfs do you want to process:");
    output.green("--------------------------------");
    output.white(filterTypesMenu);
    while (true) {
      let option = await userInput.question("Enter option: ", false, undefined, undefined);
      option = +option;
      if (1 <= option && option <= 6) {
        filterType = optionToFilterType[option];
        break;
      } else {
        output.red("Invalid, please try again");
      }
    }
  }

  let filtered;
  switch (filterType) {
    case "all": {
      filtered = found;
      break;
    }
    case "new-only": {
      filtered = found.filter((x) => x.state === Category.new);
      break;
    }
    case "new-and-prev-errors": {
      filtered = found.filter((x) => x.state === Category.new || x.state === Category.prevError);
      break;
    }
    case "by-id": {
      filtered = await byIds(args, found);
      break;
    }
    case "pattern": {
      filtered = await wildcardMatch(args, found);
      break;
    }
    case "none": {
      process.exit(0);
    }
  }
  return filtered;
}

async function byIds(args, found) {
  output.green("--------------------------------");
  while (true) {
    const idsText = await userInput.question("Enter ids (comma separated): ", false, undefined, undefined);
    const ids = idsText.split(",").map((x) => +x.trim());
    let i = 0;
    const filtered = found.filter(() => ids.includes(i++));

    output.white("Matches:\n " + filtered.map((x) => x.short).join("\n "));
    const cont = await userInput.question("Process these files? (Y/n): ", false, undefined, "y");
    if (cont == "y" || cont == "Y") {
      return filtered;
    }
  }
}

async function wildcardMatch(args, found) {
  output.green("--------------------------------");
  while (true) {
    const pattern = await userInput.question("Enter pattern: ", false, undefined, undefined);
    const matches = found.filter((x) => minimatch(x.filePath, pattern));
    output.white("Matches:\n " + matches.map((x) => x.short).join("\n "));

    const cont = await userInput.question("Process these files? (Y/n): ", false, undefined, "y");
    if (cont == "y" || cont == "Y") {
      return matches;
    }
  }
}

async function processAll(args, filtered) {
  output.green();
  output.green("--------------------------------");
  output.green("Processing:");
  output.green("--------------------------------");

  let i = 0;
  const results = [];
  const start = new Date();

  // create queue to process tasks concurrently
  const q = Async.queue(async function (task) {
    const { i, filePath, args, prev } = task;
    log.debug(`start ${i}. ${filePath}`);
    const summary = await doProcess(filePath, args, prev);
    results.push(summary);
    log.debug(`end ${i}. ${filePath}`);
  }, args.concurrent);

  // add files to task queue
  for (const filt of filtered) {
    ++i;
    if (args.max > 0 && i > args.max) {
      output.orange("max reached");
      break;
    }

    const task = {
      i,
      filePath: filt.filePath,
      args,
      prev: filt.prev,
    };
    q.push(task, function (err) {
      if (err) {
        output.red("task error", i, err);
      } else {
        log.debug("task done", i);
      }
    });
  }

  // await all file requests
  await q.drain();

  const end = new Date();
  return { start, end, results };
}

function writeIndex(args, results, prevIndex) {
  // combine current results with existing results from index
  if (prevIndex) {
    results.forEach((x) => (prevIndex[x.file] = x));
    results = Object.values(prevIndex);
  }

  if (args.test) {
    let headers = Csv.objectArrayToCsvHeaders(results);
    const omitColumns = ["requestTime", "responseTime", "duration", "requestId"];
    headers = headers.filter((x) => !omitColumns.includes(x));
    Csv.writeCsv(args.index, results, headers, false, true, "file");
  } else {
    Csv.writeCsv(args.index, results, undefined, false, true, "file");
  }
  output.white("\nWrote: " + args.index);
}

function writeSummary(numFound, results, start, end) {
  const numProcessed = results.length;
  output.green();
  output.green("--------------------------------");
  output.green("Summary:");
  output.green("--------------------------------");
  output.white(`Total found: ${numFound}`);
  output.white(`Total processed: ${numProcessed}`);
  output.white(`Time taken: ${new Duration(start, end).toString()}`);

  let ok = true;
  // API success/fails
  output.white("Processing results:");
  let count;
  // successes
  count = results.filter((x) => x.type == StatementsApi.constants.TYPES.SUCCESS).length;
  output.white(`- successes: ${count} / ${numProcessed}`);
  // fails
  count = results.filter((x) => x.type == StatementsApi.constants.TYPES.ERROR).length;
  if (count > 0) {
    output.red(`- fails: ${count} / ${numProcessed}`);
    ok = false;
  }

  // Tool exceptions
  count = results.filter((x) => x.summaryException).length;
  if (count > 0) {
    output.red(`Tool errors: ${count}`);
    ok = false;
  }
  if (!ok) {
    App.setErrorCode(App.ErrorCode.ProcessPdfFailed);
  }
}

async function doProcess(filePath, args, prev) {
  // report filename (header before any library logs for this file)
  const shortFilePath = shorten(filePath, args.folder);
  output.white(`Processing ${shortFilePath} ...`);

  // settings
  const fileSettings = pdfHelpers.findPdfSettings(filePath, args.folder);
  if (!args.quiet && !args.password && fileSettings.pass) {
    output.gray("using password from settings.json");
  }
  const password = args.password || fileSettings.pass; // if set but not required then will be ignored

  // process
  if (fileSettings.skip) {
    if (!args.quiet) {
      output.white("skipped");
    }
    return createSummarySkipped(args.folder, filePath, password);
  }

  const result = await processPdf({
    folder: args.folder,
    filePath,
    shortFilePath,
    password,
    writeOutputJson: args.writeOutputJson,
    writeOutputCsv: args.writeOutputCsv,
    quiet: args.quiet,
  });

  return result;
}

function shorten(filePath, folder) {
  // make sure we have full paths
  folder = path.resolve(folder);
  filePath = path.resolve(filePath);

  if (filePath.startsWith(folder)) {
    const l = folder.endsWith("/") || folder.endsWith("\\") ? folder.length : folder.length + 1;
    filePath = filePath.substr(l);
    return filePath;
  }
  return filePath;
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

async function processPdf({ folder, filePath, shortFilePath, password, writeOutputJson, writeOutputCsv, quiet }) {
  const requestTime = new Date();
  const { token } = App.config();
  const result = await requestPdf(token, filePath, password);
  const responseTime = new Date();

  // report success | fail
  if (!quiet) {
    if (result === undefined) {
      output.red(`${shortFilePath}: error: no response`);
    } else if (result.type === StatementsApi.constants.TYPES.ERROR) {
      output.red(`${shortFilePath}: error:`, result.code);
    } else {
      output.green(`${shortFilePath}: success`);
      // output.white(`${shortFilePath}: SUCCESS:`, result.data.parser, result.code)
    }
  }

  if (result) {
    if (writeOutputJson) {
      pdfHelpers.writeOutputJson(filePath, result);
    }
    if (writeOutputCsv && result.type == StatementsApi.constants.TYPES.SUCCESS) {
      pdfHelpers.writeOutputCsv(filePath, result.data);
    }
  }

  // summary for index
  const summary = {};
  try {
    // NOTE: keep in sync with $/spike-db/src/pdfResult.js
    let dataSummary = {};
    if (result && result.type == StatementsApi.constants.TYPES.SUCCESS) {
      dataSummary = pdfHelpers.getPdfResultSummary(result.data);
    }
    summary.file = folder ? shorten(filePath, folder) : path.basename(filePath);
    summary.requestTime = requestTime;
    summary.responseTime = responseTime;
    summary.duration = new Duration(requestTime, responseTime).toString();
    summary.requestId = result && result.requestId;
    summary.type = result ? result.type : StatementsApi.constants.TYPES.ERROR;
    summary.code = result ? result.code : "no result";
    summary.parser = dataSummary.parser;
    summary.numTransactions = dataSummary.numTransactions;
    summary.numBreaks = dataSummary.numBreaks;
    summary.accountNumber = dataSummary.accountNumber;
    summary.issuedOn = dataSummary.issuedOn;
    summary.from = dataSummary.from;
    summary.to = dataSummary.to;
    summary.nameAddress = dataSummary.nameAddress;
    summary.detected = dataSummary.detected;
    summary.flags = dataSummary.flags;
  } catch (ex) {
    log.fatal(`${filePath}: exception whilst creating summary:`, ex);
    output.red(`${filePath}: exception whilst creating summary`);
    summary.summaryException = true;
  }
  return summary;
}

function createSummarySkipped(folder, filePath, password) {
  return {
    type: StatementsApi.constants.TYPES.NOTSET,
    code: "skipped",
    file: folder ? shorten(filePath, folder) : path.basename(filePath),
    password,
  };
}
