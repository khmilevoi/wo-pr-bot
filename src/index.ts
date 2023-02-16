import * as TelegramBot from "node-telegram-bot-api";

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

createCommands(bot, [
  {
    command: "/get",
    description: "Get Pull Requests",
    callback: async (message) => {
      try {
        await bot.sendMessage(message.chat.id, "...Loading");

        const report = await loadPullRequests();

        await bot.sendMessage(message.chat.id, report);
      } catch (error) {
        await bot.sendMessage(message.chat.id, "error");
      }
    },
  },
]);
