const chalk = require("chalk");
// const errorHelper = require("./errorHelper");

exports.green = function (...args) {
  logger(chalk.green, console.log, ...args);
};

exports.gray = function (...args) {
  logger(chalk.gray, console.log, ...args);
};

exports.white = function (...args) {
  logger(chalk.white, console.log, ...args);
};

exports.orange = function (...args) {
  logger(chalk.orange, console.log, ...args);
};

exports.red = function (...args) {
  logger(chalk.red, console.log, ...args);
};

exports.yellow = function (...args) {
  logger(chalk.yellow, console.log, ...args);
};

function logger(colors, consolelogger, ...args) {
  // errorHelper.stringifyErrors(args);
  consolelogger(colors(...args));
}
