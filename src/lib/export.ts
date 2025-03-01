import inquirer from "inquirer";
import dayjs from "dayjs";
import { getCredentials, updateCredentials } from "./db";
import { getTaskLists, getTasks, regenerateAccessToken } from "./tasks";
import { createFile } from "./fileHandler";

export const exportTasks = async (outputFile: string) => {
  console.log(`Fetching tasks and creating Markdown file: ${outputFile}...`);

  // Step 1: Get credentials
  let credentials = await getCredentials();
  if (!credentials) {
    console.error(
      "No credentials found. Please run the connect command first."
    );
    process.exit(1);
  }

  const currentTimestamp = dayjs();
  const accessTokenExpiry = dayjs(credentials.accessTokenExpiry);
  const refreshTokenExpiry = dayjs(credentials.refreshTokenExpiry);

  // if refresh token is expired, exit
  if (currentTimestamp.isAfter(refreshTokenExpiry)) {
    console.error("Refresh token has expired. Please run the connect command.");
    process.exit(1);
  }

  if (currentTimestamp.isAfter(accessTokenExpiry)) {
    const token = await regenerateAccessToken(credentials.refresh_token);
    credentials = await updateCredentials(
      credentials.id,
      token.refresh_token,
      token.access_token,
      token.expires_in,
      token.refresh_token_expires_in
    );
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

  // Sort tasks by position based on lexicographical ordering
  tasks.items.sort((a: any, b: any) => a.position.localeCompare(b.position));

  // Create a map of tasks by their id for easy lookup
  const taskMap = new Map(tasks.items.map((task: any) => [task.id, task]));

  // Function to format a task and its subtasks
  const formatTask = (task: any, indent: string = ""): string => {
    const completed = task.status === "completed" ? "x" : " ";
    const createdAt = dayjs(task.created).format("MMMM D, YYYY h:mm A");
    const due = task.due
      ? `Due: ${dayjs(task.due).format("MMMM D, YYYY h:mm A")}`
      : "";
    const notes = task.notes ? `\n${indent}   ${task.notes}` : "";
    const taskString = `${indent}- [${completed}] ${task.title} (Created at: ${createdAt}) ${due}${notes}`;

    // Find and format subtasks
    const subtasks = tasks.items.filter((t: any) => t.parent === task.id);
    const subtaskStrings = subtasks
      .map((subtask: any) => formatTask(subtask, indent + "  "))
      .join("");

    return `${taskString}\n${subtaskStrings}`;
  };

  // Format tasks into strings, starting with top-level tasks
  const taskStrings = tasks.items
    .filter((task: any) => !task.parent)
    .map((task: any) => formatTask(task))
    .join("\n");

  // Create file with the formatted tasks
  createFile(outputFile, taskStrings);
  console.log(`Markdown file created successfully: ${outputFile}`);
};
