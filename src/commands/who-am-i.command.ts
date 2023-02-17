import TelegramBot from "node-telegram-bot-api";
import { userStorage } from "../storages";
import { ICommand } from "../create-commands";

export const createWhoAmICommand = (bot: TelegramBot): ICommand => {
  return {
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
  };
};
