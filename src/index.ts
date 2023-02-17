import TelegramBot, { Message } from "node-telegram-bot-api";
import * as cron from "node-cron";
import { ScheduledTask } from "node-cron";

import {
  getPullRequests,
  IGetPullRequestsConfig,
  IGetPullRequestsFlags,
} from "./get-pull-requests";
import { generateReport } from "./generate-report";
import { createAzureConnection } from "./create-azure-connection";
import { config } from "./config";
import { createCommands } from "./create-commands";
import { UserStorage } from "./user-storage";

const api = createAzureConnection();

const loadPullRequests = async (pullRequestsConfig: IGetPullRequestsConfig) => {
  const repositories = await getPullRequests(
    api,
    config.repositories,
    pullRequestsConfig
  );

  return generateReport(config.azureOrg, repositories);
};

const userStorage = new UserStorage();

const bot = new TelegramBot(config.telegramBotToken, { polling: true });

const getMessage = async (message: Message, flags: IGetPullRequestsFlags) => {
  try {
    await bot.sendMessage(message.chat.id, "...Loading");

    const currentUser = userStorage.getUser(message.chat.id);

    const report = await loadPullRequests({
      ...flags,
      userEmail: currentUser?.email,
    });

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
    description: "Command to retrieve pull requests with an optional --all flag.",
    callback: async (message) => {
      const flags = message.text.replace("/get", "").trim().split(/\s+/);

      const config = flags.reduce<IGetPullRequestsFlags>(
        (result, flag) => {
          if (flag === "--all") {
            return {
              ...result,
              isAll: true,
            };
          }

          return result;
        },
        { isAll: false }
      );

      getMessage(message, config);
    },
  },
  {
    command: "/cronstart",
    description: "Command to start a new cron job with an optional custom cron string.",
    callback: async (message) => {
      const customCron = message.text.replace("/cronstart", "").trim();

      const prevTask = tasks[message.chat.id];

      if (prevTask) {
        await bot.sendMessage(message.chat.id, "Previous cron stopped");
        prevTask.stop();
      }

      const cronString =
        customCron.length === 0 ? "0 10-18/2 * * *" : customCron;

      tasks[message.chat.id] = cron.schedule(cronString, () => {
        getMessage(message, { isAll: true });
      });

      await bot.sendMessage(message.chat.id, `New cron started ${cronString}`);
    },
  },
  {
    command: "/cronstop",
    description: "Command to stop the cron job running for the chat.",
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
  {
    command: "/login",
    description: "Command to set the email of the user for the chat.",
    callback: async (message) => {
      const email = message.text.replace("/login", "").trim();

      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        await bot.sendMessage(message.chat.id, "Invalid email");

        return;
      }

      userStorage.updateUser(message.chat.id, {
        email: email,
      });

      await bot.sendMessage(message.chat.id, "User saved");
    },
  },
  {
    command: "/whoami",
    description: "Command to check the email of the user for the chat.",
    callback: async (message) => {
      const user = userStorage.getUser(message.chat.id);

      if (user) {
        await bot.sendMessage(message.chat.id, `You are ${user.email}`);
      } else {
        await bot.sendMessage(message.chat.id, `You are nobody`);
      }
    },
  },
]);
