import chalk from 'chalk';

/**
 * Logs a empty lines
 * @param {number} lines - Defaults to 1. Number of lines to print
 */
export function empty(lines = 1): void {
  console.log('\n'.repeat(lines));
}

/**
 * Logs a message with a prefix and the date
 * @param {string} msg - The message to log
 */
export function log(msg: string): void {
  console.log(msg);
}

/**
 * Shows an error with a prefix
 * @param {string} msg - The message to log
 */
export function error(msg: string): void {
  console.log(`${chalk.bgRed(' ✗ ')} ${msg}`);
}

/**
 * Shows a success message with a prefix
 * @param {string} msg - The message to log
 */
export function success(msg: string): void {
  console.log(`${chalk.bgGreen(' ✔ ')} ${msg}`);
}

/**
 * Shows an information message with a prefix
 * @param {string} msg - The message to log
 */
export function info(msg: string): void {
  console.log(`${chalk.black.bgCyan(' ℹ ')} ${msg}`);
}
