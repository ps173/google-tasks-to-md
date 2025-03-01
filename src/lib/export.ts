import inquirer from "inquirer";
import dayjs from "dayjs";
import { getCredentials } from "./db";
import { getTaskLists, getTasks } from "./tasks";
import { createFile } from "./fileHandler";

export const exportTasks = async (outputFile: string) => {
  console.log(`Fetching tasks and creating Markdown file: ${outputFile}...`);

  // Step 1: Get credentials
  const credentials = await getCredentials();
  if (!credentials) {
    console.error(
      "No credentials found. Please run the connect command first."
    );
    process.exit(1);
  }

  const currentTimestamp = dayjs();
  const accessTokenExpiry = dayjs(credentials.accessTokenExpiry);

  if (currentTimestamp.isAfter(accessTokenExpiry)) {
    console.error(
      "Credentials have expired. Please run the connect command again."
    );
    process.exit(1);
  }

  // Step 2: Get task lists
  const taskLists = await getTaskLists(credentials.access_token);
  const taskListChoices = taskLists.items.map((list: any) => ({
    name: list.title,
    value: list.id,
  }));

  const { selectedTaskListId } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedTaskListId",
      message: "Select a task list:",
      choices: taskListChoices,
    },
  ]);

  // Step 3: Get tasks for the selected task list
  const tasks = await getTasks(credentials.access_token, selectedTaskListId);

  // Format tasks into strings
  const taskStrings = tasks.items
    .map((task: any) => {
      const completed = task.status === "completed" ? "x" : " ";
      const createdAt = dayjs(task.created).format("MMMM D, YYYY h:mm A");
      const due = task.due
        ? `Due: ${dayjs(task.due).format("MMMM D, YYYY h:mm A")}`
        : "";
      const notes = task.notes ? `\n   ${task.notes}` : "";
      return `- [${completed}] ${task.title} (Created at: ${createdAt}) ${due}${notes}`;
    })
    .join("\n");

  // Create file with the formatted tasks
  createFile(outputFile, taskStrings);
  console.log(`Markdown file created successfully: ${outputFile}`);
};
