import chalk from "chalk";
import ora from "ora";
export const logger = {
    info(message) {
        console.log(chalk.cyan(message));
    },
    success(message) {
        console.log(chalk.green(message));
    },
    warn(message) {
        console.log(chalk.yellow(message));
    },
    error(message) {
        console.error(chalk.red(message));
    },
    plain(message = "") {
        console.log(message);
    }
};
export function startSpinner(message) {
    return ora(message).start();
}
//# sourceMappingURL=logger.js.map