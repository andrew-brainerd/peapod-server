import chalk from 'chalk';
import { getError } from './error.js';

const { log } = console;

export const info = (message: string, opts?: unknown) => (opts ? log(message, opts) : log(message));

export const cool = (message: string, opts?: unknown) =>
  opts ? log(chalk.blue(message), opts) : log(chalk.blue(message));

export const success = (message: string, opts?: unknown) =>
  opts ? log(chalk.green(message), opts) : log(chalk.green(message));

export const warn = (message: string, opts?: unknown) =>
  opts ? log(chalk.yellow(message), opts) : log(chalk.yellow(message));

export const error = (message: string, err: Record<string, unknown> = {}, opts?: unknown) =>
  opts
    ? log(chalk.red(`${message}${getError(err as Parameters<typeof getError>[0])}`), opts)
    : log(chalk.red(`${message}${getError(err as Parameters<typeof getError>[0])}`));
