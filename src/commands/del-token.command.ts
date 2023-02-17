import TelegramBot from "node-telegram-bot-api";
import { userStorage } from "../storages";
import { ICommand } from "../create-commands";

export const createDelTokenCommand = (bot: TelegramBot): ICommand => {
  return {
    command: "/deltoken",
    description:
      "Command to delete the personal access token of the user for the chat.",
    callback: async (message) => {
      const user = userStorage.getUser(message.chat.id);

      if (user == null) {
        await bot.sendMessage(message.chat.id, "You must be logged in");

        return;
      }

      userStorage.updateUser(message.chat.id, {
        ...user,
        token: undefined,
      });

      await bot.sendMessage(message.chat.id, "Token removed");
    },
  };
};
