import TelegramBot from "node-telegram-bot-api";
import { taskStorage } from "../storages";
import { ICommand } from "../create-commands";

export const createCronStopCommand = (bot: TelegramBot): ICommand => ({
  command: "/cronstop",
  description: "Command to stop the cron job running for the chat.",
  callback: async (message) => {
    const isStopped = taskStorage.stopCron(message.chat.id);

    if (isStopped) {
      await bot.sendMessage(message.chat.id, "Cron stopped");
    } else {
      await bot.sendMessage(message.chat.id, "Cron not running");
    }
  },
});
