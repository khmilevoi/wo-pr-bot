import { ICommand } from "../create-commands";
import { loadPullRequestsCommand } from "./load-pull-requests.command";
import TelegramBot from "node-telegram-bot-api";

export const createGetAllCommand = (bot: TelegramBot): ICommand => ({
  command: "/getall",
  description: "Command to retrieve all pull requests.",
  callback: async (message) => {
    loadPullRequestsCommand(bot, message, { isAll: true });
  },
});
