import { checkEnvironment, type EnvironmentCheck, type EnvironmentReport } from "@luucaohoang/lumit-core";
import chalk from "chalk";
import { logger } from "../utils/logger.js";

export async function doctorCommand(): Promise<void> {
  try {
    const report = await checkEnvironment();
    printReport(report);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Unable to check environment.");
    process.exitCode = 1;
  }
}

function printReport(report: EnvironmentReport): void {
  logger.plain();
  logger.info("Lumit environment report");
  logger.plain();
  printCheck(report.node);
  Object.values(report.packageManagers).forEach(printCheck);
  printCheck(report.git);
  printCheck(report.githubCli);
  printCheck(report.githubAuth);
  logger.plain();
}

function printCheck(check: EnvironmentCheck): void {
  const marker = check.available ? chalk.green("OK") : chalk.red("MISSING");
  const version = check.version ? ` ${chalk.gray(check.version)}` : "";
  const detail = check.detail ? ` ${chalk.gray(check.detail)}` : "";
  logger.plain(`${marker} ${check.name}${version}${detail}`);
}
