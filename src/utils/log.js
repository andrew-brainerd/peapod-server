const chalk = require('chalk');
const { log } = console;

exports.info = (message, opts) => !!opts ?
  log(message, opts) : log(message);

exports.cool = (message, opts='') => !!opts ?
  log(chalk.blue(message), opts) : log(chalk.blue(message));

exports.success = (message, opts='') =>
  !!opts ? log(chalk.green(message), opts) : log(chalk.green(message));

exports.error = (message, opts='') => !!opts ?
  log(chalk.red(message), opts) : log(chalk.red(message));
