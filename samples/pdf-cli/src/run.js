const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const Configure = require("./command/configure");
const Combine = require("./command/combine");
const Folder = require("./command/folder");
const Single = require("./command/single");
const Config = require("./config/index");
const { version } = require("../package.json");

const allConfigs = Object.keys(Config).filter((x) => x !== "checkConfig");
const allFilterTypes = Object.keys(Folder.FilterTypes);
const DescriptionCsvFormats = Object.values(Combine.DescriptionCsvFormat);
const WhichDates = Object.values(Combine.WhichDate);
const Columnss = Object.keys(Combine.Columns);
const defaultColumns = [
  Combine.Columns.date,
  // Combine.Columns.category, // credit card
  // Combine.Columns.transactionDate, // credit card
  // Combine.Columns.processDate, // credit card
  Combine.Columns.description1,
  Combine.Columns.description2,
  Combine.Columns.description3,
  Combine.Columns.description4,
  Combine.Columns.amount,
  Combine.Columns.balance,
];
yargs(hideBin(process.argv))
  .version(version)
  .command(
    "configure",
    "Configure the tool with your keys",
    {
      config: {
        choices: allConfigs,
        default: "default",
        describe: "Specify filtering on commandline, rather than by manual input",
      },
      verbose: {
        type: "boolean",
        describe: "print log messages",
        default: false,
      },
      jwksUri: {
        type: "string",
        describe: "url for jwks.json to verify jwt token (for unit testing primarily)",
      },
    },
    Configure.command
  )
  .command(
    "folder",
    "Recurse through a folder and process all .pdfs found",
    {
      // shared
      config: {
        choices: allConfigs,
        default: "default",
        describe: "Specify filtering on commandline, rather than by manual input",
      },
      verbose: {
        type: "boolean",
        describe: "print log messages",
        default: false,
      },
      test: {
        type: "boolean",
        default: false,
        describe: "don't use this flag, it's used internally for unit tests",
      },
      writeOutputCsv: {
        type: "boolean",
        default: true,
        describe: "write .csv = just transactions from .pdf",
      },
      writeOutputJson: {
        type: "boolean",
        default: true,
        describe: "write .json = full result extracted from .pdf",
      },
      writeOutput: {
        type: "boolean",
        default: true,
        describe: "shortcut to set --writeOutput*=true|false",
      },
      // command-specific
      writeIndex: {
        type: "boolean",
        default: true,
        describe: "write results to index.csv file - useful to switch it off if changing identify() functions",
      },
      index: {
        type: "string",
        // default: path.join(args.folder, "folder.csv"), // see fixArgs
        describe: "path to summary index file",
      },
      folder: {
        alias: "f",
        type: "string",
        demand: true,
        describe: "folder with PDF files",
      },
      stripFolder: {
        type: "boolean",
        default: true,
        describe: "remove folder from path in outputs",
      },
      filterPath: {
        type: "string",
        describe: "regex to match against paths of files found in folder",
      },
      max: {
        type: "number",
        default: -1,
        describe: "End after max files - ignored if max <= 0",
      },
      "dry-run": {
        type: "boolean",
        default: false,
        describe: "just list files found which match filters",
      },
      concurrent: {
        type: "number",
        default: 1,
        describe: "Number of concurrent requests to execute in parallel",
      },
      filterType: {
        choices: allFilterTypes,
        // default: "all",
        describe: "Specify filtering on commandline, rather than by manual input",
      },
    },
    Folder.command
  )
  .command(
    "single",
    "Process a single .pdf",
    {
      // shared
      config: {
        choices: allConfigs,
        default: "default",
        describe: "Specify filtering on commandline, rather than by manual input",
      },
      verbose: {
        type: "boolean",
        describe: "print log messages",
        default: false,
      },
      test: {
        type: "boolean",
        default: false,
        describe: "don't use this flag, it's used internally for unit tests",
      },
      writeOutputCsv: {
        type: "boolean",
        default: true,
        describe: "write .csv = just transactions from .pdf",
      },
      writeOutputJson: {
        type: "boolean",
        default: true,
        describe: "write .json = full result extracted from .pdf",
      },
      writeOutput: {
        type: "boolean",
        default: false,
        describe: "shortcut to set --writeOutput*=true|false",
      },
      // command-specific
      file: {
        alias: "f",
        demand: true,
        describe: "the .pdf file to process",
        type: "string",
      },
      password: {
        alias: "p",
        describe: "the password for the .pdf (if password protected)",
        type: "string",
      },
    },
    Single.command
  )
  .command(
    "combine",
    "combine .json output from previously processed pdfs into a single .csv",
    {
      config: {
        choices: allConfigs,
        default: "default",
        describe: "Specify filtering on commandline, rather than by manual input",
      },
      verbose: {
        type: "boolean",
        describe: "print log messages",
        default: false,
      },
      outputCsv: {
        alias: "o",
        type: "string",
        demand: true,
        describe: "where to write combined.csv output",
      },
      folder: {
        alias: "f",
        type: "string",
        demand: true,
        describe: "folder with PDF files",
      },
      filterPath: {
        type: "string",
        describe: "regex to match against paths of files found in folder",
      },
      descriptionCsvFormat: {
        choices: DescriptionCsvFormats,
        default: Combine.DescriptionCsvFormat.SeparateColumns,
        describe:
          "How to export the 'description' column when there are multi-line transactions - either one column per line, or all combined into 1 column",
      },
      whichDate: {
        choices: WhichDates,
        default: Combine.WhichDate.Processed,
        describe:
          "Credit card transactions have 2 dates, processed and transaction. Pick which one to use for 'date' column.",
      },
      columns: {
        array: true,
        choices: Columnss,
        default: defaultColumns,
        describe: "Which columns to include in the combined .csv",
      },
      sortAsc: {
        array: true,
        choices: Columnss,
        describe: "sort combined csv by this/these column(s) in ascending order",
      },
      sortDesc: {
        array: true,
        choices: Columnss,
        describe: "sort combined csv by this/these column(s) in descending order",
      },
      "dry-run": {
        type: "boolean",
        default: false,
        describe: "just list files found which match filters",
      },
    },
    Combine.command
  )
  .strictCommands()
  .strict()
  .help()
  .wrap(100).argv;
