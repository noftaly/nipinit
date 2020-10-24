import chalk from 'chalk';


export default abstract class Logger {
  static empty(lines = 1): void {
    console.log('\n'.repeat(lines));
  }

  /**
   * Logs a message with a prefix and the date
   * @param {string} msg - The message to log
   */
  static log(msg: string): void {
    console.log(msg);
  }

  /**
   * Shows an error with a prefix
   * @param {string} msg - The message to log
   */
  static error(msg: string): void {
    console.log(`${chalk.bgRed(' ✗ ')} ${msg}`);
  }

  /**
   * Shows a success message with a prefix
   * @param {string} msg - The message to log
   */
  static success(msg: string): void {
    console.log(`${chalk.bgGreen(' ✔ ')} ${msg}`);
  }

  /**
   * Shows an information message with a prefix
   * @param {string} msg - The message to log
   */
  static info(msg: string): void {
    console.log(`${chalk.black.bgCyan(' ℹ ')} ${msg}`);
  }
}
