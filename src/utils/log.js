const chalk = require('chalk');
const { log } = console;

const info = (message, opts) => !!opts ?
  log(message, opts) : log(message);

const cool = (message, opts = '') => !!opts ?
  log(chalk.blue(message), opts) : log(chalk.blue(message));

const success = (message, opts = '') =>
  !!opts ? log(chalk.green(message), opts) : log(chalk.green(message));

const warn = (message, opts = '') => !!opts ?
  log(chalk.yellow(message), opts) : log(chalk.yellow(message));

const error = (message, opts = '') => !!opts ?
  log(chalk.red(message), opts) : log(chalk.red(message));

module.exports = {
  info,
  cool,
  success,
  warn,
  error
};
