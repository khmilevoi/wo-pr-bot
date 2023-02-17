import TelegramBot from "node-telegram-bot-api";
import { ICommand } from "../create-commands";
import { userStorage } from "../storages";

export const createSetTokenCommand = (bot: TelegramBot): ICommand => {
  return {
    command: "/settoken",
    description:
      "Command to set the personal access token of the user for the chat.",
    callback: async (message) => {
      const token = message.text?.replace("/settoken", "").trim();

      const user = userStorage.getUser(message.chat.id);

      if (user == null) {
        await bot.sendMessage(message.chat.id, "You must be logged in");

        return;
      }

      if (token === "") {
        await bot.sendMessage(message.chat.id, "Invalid token");

        return;
      }

      userStorage.updateUser(message.chat.id, {
        ...user,
        token,
      });

      await bot.sendMessage(message.chat.id, "Token saved");
    },
  };
};
