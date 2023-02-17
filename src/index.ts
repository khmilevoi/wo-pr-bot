import TelegramBot, { Message } from "node-telegram-bot-api";
import * as cron from "node-cron";
import { ScheduledTask } from "node-cron";

import { getPullRequests } from "./get-pull-requests";
import { generateReport } from "./generate-report";
import { createAzureConnection } from "./create-azure-connection";
import { config } from "./config";
import { createCommands } from "./create-commands";

const api = createAzureConnection();

const loadPullRequests = async () => {
  const repositories = await getPullRequests(api, config.repositories);

  return generateReport(config.azureOrg, repositories);
};

const bot = new TelegramBot(config.telegramBotToken, { polling: true });

const getMessage = async (message: Message) => {
  try {
    await bot.sendMessage(message.chat.id, "...Loading");

    const report = await loadPullRequests();

    await bot.sendMessage(
      message.chat.id,
      report.replaceAll(/([-.])/g, "\\$1"),
      { parse_mode: "MarkdownV2" }
    );
  } catch (error) {
    console.error(error);
    await bot.sendMessage(message.chat.id, "error");
  }
};

const tasks: { [key: string]: ScheduledTask } = {};

createCommands(bot, [
  {
    command: "/get",
    description: "Get Pull Requests",
    callback: async (message) => {
      getMessage(message);
    },
  },
  {
    command: "/cronstart",
    description: "Start Cron",
    callback: async (message) => {
      const prevTask = tasks[message.chat.id];

      if (prevTask) {
        await bot.sendMessage(message.chat.id, "Previous cron stopped");
        prevTask.stop();
      }

      tasks[message.chat.id] = cron.schedule("0 10-18/2 * * *", () => {
        getMessage(message);
      });

      await bot.sendMessage(message.chat.id, "New cron started");
    },
  },
  {
    command: "/cronstop",
    description: "Stop Cron",
    callback: async (message) => {
      const task = tasks[message.chat.id];

      if (task) {
        task.stop();
        await bot.sendMessage(message.chat.id, "Cron stopped");
      } else {
        await bot.sendMessage(message.chat.id, "Cron not running");
      }
    },
  },
]);
