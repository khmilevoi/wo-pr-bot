import TelegramBot, { Message } from "node-telegram-bot-api";
import * as cron from "node-cron";

import { getPullRequests } from "./get-pull-requests";
import { generateReport } from "./generate-report";
import { createAzureConnection } from "./create-azure-connection";
import { config } from "./config";
import { createCommands } from "./create-commands";

const api = createAzureConnection();

const loadPullRequests = async () => {
  const repositories = await getPullRequests(api, [
    "wofusion-ui",
    "wofusion-ui-sharedlib",
    "wofusion-admin-ui",
    "wonotifications",
    "wonotifications-app",
  ]);

  // fs.writeFile("./report.txt", report);

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

createCommands(bot, [
  {
    command: "/get",
    description: "Get Pull Requests",
    callback: async (message) => {
      getMessage(message);
    },
  },
  {
    command: "/cron",
    description: "Start Cron",
    callback: (message) => {
      cron.schedule("* * */2 * * *", () => {
        getMessage(message);
      });
    },
  },
]);
