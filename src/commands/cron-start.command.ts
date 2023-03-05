import * as cron from "node-cron";
import { ICommand } from "../create-commands";
import { taskStorage } from "../storages";
import { loadPullRequestsCommand } from "./load-pull-requests.command";
import TelegramBot from "node-telegram-bot-api";

export const createCronStartCommand = (bot: TelegramBot): ICommand => ({
  command: "/cronstart",
  description:
    "Command to start a new cron job with an optional custom cron string.",
  callback: async (message) => {
    const customCron = message.text?.replace("/cronstart", "").trim();

    const cronString = customCron ? customCron : "0 10-18/2 * * *";

    const isStopped = taskStorage.addCron(
      message.chat.id,
      cron.schedule(cronString, () => {
        loadPullRequestsCommand(bot, message, { isAll: true });
      })
    );

    if (isStopped) {
      await bot.sendMessage(message.chat.id, "Previous cron stopped");
    }

    await bot.sendMessage(message.chat.id, `New cron started ${cronString}`);
  },
});
