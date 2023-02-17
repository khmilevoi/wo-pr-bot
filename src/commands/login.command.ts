import TelegramBot from "node-telegram-bot-api";
import { ICommand } from "../create-commands";
import { userStorage } from "../storages";

export const createLoginCommand = (bot: TelegramBot): ICommand => {
  return {
    command: "/login",
    description: "Command to set the email of the user for the chat.",
    callback: async (message) => {
      const email = message.text?.replace("/login", "").trim() ?? "";

      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        await bot.sendMessage(message.chat.id, "Invalid email");

        return;
      }

      userStorage.updateUser(message.chat.id, {
        email: email,
      });

      await bot.sendMessage(message.chat.id, "User saved");
    },
  };
};
