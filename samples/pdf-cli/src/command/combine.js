const fs = require("fs");
const { format } = require("@fast-csv/format");
const App = require("../App");
const output = require("../lib/output");
const pdfHelpers = require("../lib/pdfHelpers");

function fixArgs(args) {
  if (args.filterPath) {
    args.filterPath = new RegExp(args.filterPath);
  }
}

exports.command = async function (args) {
  try {
    fixArgs(args);
    await App.init(args);
    await combine(args);
  } catch (ex) {
    output.red("An unknown error halted the application. Try re-run with `--verbose`.");
    log.error("exception", ex);
  }
};

async function combine(args) {
  let filePaths = await pdfHelpers.find(args.folder, args.filterPath, ".json");
  filePaths = filePaths.filter((x) => !/settings.json$/.test(x));

  // early out
  if (args.dryRun) {
    output.white("found:", filePaths.join("\n "));
    return;
  }

  let csvRows = [];
  for (const jsonPath of filePaths) {
    const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const csv = getTransactionsForCsv(json.data, args.whichDate, args.descriptionCsvFormat);
    csvRows = csvRows.concat(csv);
  }

  // write .csv
  const sortCols = {};
  let hasSortCols = false;
  if (args.sortAsc) {
    hasSortCols = true;
    for (const s of args.sortAsc) {
      sortCols[s] = 1;
    }
  }
  if (args.sortDesc) {
    hasSortCols = true;
    for (const s of args.sortDesc) {
      sortCols[s] = -1;
    }
  }
  writeCsv(args.outputCsv, csvRows, args.columns, hasSortCols ? sortCols : undefined);
}

//#region write transactions

function writeCsv(csvPath, objectArray, columns, sortCols) {
  let stream;
  if (sortCols) {
    objectArray = sortCsv(objectArray, sortCols);
  }
  if (columns) {
    stream = format({ headers: columns, delimiter: "," });
  } else {
    stream = format({ headers: true, delimiter: "," });
  }
  const s = fs.createWriteStream(csvPath, "utf8");
  s.on("error", function (err) {
    console.log(err);
  });
  stream.pipe(s);
  objectArray.forEach((x) => stream.write(x));
  stream.end();
  output.yellow("Wrote:", csvPath);
}

function sortCsv(csvRows, sortCols) {
  function compare(a, b, col, direction) {
    let av = a[col] || "";
    let bv = b[col] || "";
    av = "" + av;
    bv = "" + bv;
    const v = av.localeCompare(bv);
    return v === 0 ? 0 : direction === 1 ? v : -v;
  }

  let i = 0;
  csvRows.forEach((x) => (x.i = ++i));
  return csvRows.sort((a, b) => {
    for (const s in sortCols) {
      const col = s;
      const direction = sortCols[s];
      const v = compare(a, b, col, direction);
      if (v !== 0) return v;
    }
    return compare(a, b, "i", 1); // all columns must be equal - use original order = i
  });
}

//#endregion

//#region json to transactions

const DescriptionCsvFormat = {
  SeparateColumns: "SeparateColumns",
  ConcatenatedWithNewLines: "ConcatenatedWithNewLines",
};
exports.DescriptionCsvFormat = DescriptionCsvFormat;
const Columns = {
  date: "date",
  category: "category", // credit card
  transactionDate: "transactionDate", // credit card
  processDate: "processDate", // credit card
  description: "description", // ConcatenatedWithNewLines
  description1: "description1",
  description2: "description2",
  description3: "description3",
  description4: "description4",
  amount: "amount",
  balance: "balance",
};
exports.Columns = Columns;
const WhichDate = {
  Transaction: "Transaction",
  Processed: "Processed",
};
exports.WhichDate = WhichDate;

function getTransactionsForCsv(
  data,
  whichDate,
  descriptionCsvFormat
  // isCreditCard
) {
  const transactions = [];
  let numDescriptionCols = 0;
  let id = 0;
  // use array to support multi-user e.g. credit-card-breakdown-multi-user
  let arr;
  if (Array.isArray(data)) {
    arr = data;
  } else {
    arr = [data];
  }
  for (const d of arr) {
    // NOTE: d.transactions doesn't exist on CreditCardBreakdownMultiUser - however that's handled by the Array.isArray check above, CreditCardBreakdownMultiUser is handled same[]
    if (Array.isArray(d.transactions)) {
      for (const t of d.transactions) {
        // extra cols
        const o = {
          id: ++id,
        };
        const marshalled = Object.assign(o, t);
        if (marshalled.date) {
          marshalled.date = new Date(marshalled.date);
          marshalled.date = marshalled.date.toISOString().substr(0, 10);
        } else {
          switch (whichDate) {
            case WhichDate.Transaction:
              marshalled.transactionDate = new Date(marshalled.transactionDate);
              marshalled.date = marshalled.transactionDate.toISOString().substr(0, 10);
              break;
            case WhichDate.Processed:
              marshalled.processDate = new Date(marshalled.processDate);
              marshalled.date = marshalled.processDate.toISOString().substr(0, 10);
              break;
            default:
              throw new Error("unknown WhichDate: " + whichDate);
          }
        }
        if (marshalled.transactionDate) {
          marshalled.transactionDate = new Date(marshalled.transactionDate);
          marshalled.transactionDate = marshalled.transactionDate.toISOString().substr(0, 10);
        }
        if (marshalled.processDate) {
          marshalled.processDate = new Date(marshalled.processDate);
          marshalled.processDate = marshalled.processDate.toISOString().substr(0, 10);
        }

        // description
        delete marshalled.description;
        if (Array.isArray(t.description)) {
          switch (descriptionCsvFormat) {
            case DescriptionCsvFormat.SeparateColumns:
              // multiple columns = description1, description2, ...
              let i = 1;
              for (const d of t.description) {
                marshalled["description" + i++] = d;
              }
              if (t.description.length > numDescriptionCols) {
                numDescriptionCols = t.description.length;
              }
              break;
            case DescriptionCsvFormat.ConcatenatedWithNewLines:
              marshalled.description = t.description.join("\r\n");
              break;
            default:
              throw new Error("unknown DescriptionCsvFormat: " + descriptionCsvFormat);
          }
        } else {
          console.error("INVALID description:", JSON.stringify(t));
        }

        transactions.push(marshalled);
      }
    }
  }
  return transactions;
}

//#endregion
