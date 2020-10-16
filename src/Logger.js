import chalk from 'chalk';


class Logger {
  /**
   * Logs a message with a prefix and the date
   * @param {string} msg - The message to log
   */
  log(msg) {
    console.log(msg);
  }

  /**
   * Shows an error with a prefix
   * @param {string} msg - The message to log
   */
  error(msg) {
    console.log(`${chalk.bgRed(' ✗ ')} ${msg}`);
  }

  /**
   * Shows a success message with a prefix
   * @param {string} msg - The message to log
   */
  success(msg) {
    console.log(`${chalk.bgGreen(' ✔ ')} ${msg}`);
  }

  /**
   * Shows an information message with a prefix
   * @param {string} msg - The message to log
   */
  info(msg) {
    console.log(`${chalk.black.bgCyan(' ℹ ')} ${msg}`);
  }
}

const logger = new Logger();

export default logger;
