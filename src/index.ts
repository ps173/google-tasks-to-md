import { program } from "commander";
import { connectToGoogle } from "./lib/connect";
import { exportTasks } from "./lib/export";

program
  .name("tasks-to-md")
  .description("CLI to fetch Google Tasks and create a Markdown file")
  .version("0.1.0");

program
  .command("connect")
  .description("Connect to Google account")
  .action(connectToGoogle);

program
  .command("export <outputFile>")
  .description("Fetch tasks from Google Tasks API and create a Markdown file")
  .action(exportTasks);

program.parse(process.argv);
