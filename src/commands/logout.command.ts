import TelegramBot from "node-telegram-bot-api";
import { ICommand } from "../create-commands";
import { userStorage } from "../storages";

export const createLogoutCommand = (bot: TelegramBot): ICommand => {
  return {
    command: "/logout",
    description: "Command to remove current user.",
    callback: async (message) => {
      userStorage.removeUser(message.chat.id);

      await bot.sendMessage(message.chat.id, "User removed");
    },
  };
};
