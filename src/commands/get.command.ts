import { ICommand } from "../create-commands";
import { loadPullRequestsCommand } from "./load-pull-requests.command";
import TelegramBot from "node-telegram-bot-api";

export const createGetCommand = (bot: TelegramBot): ICommand => ({
  command: "/get",
  description: "Command to retrieve pull requests for current user.",
  callback: async (message) => {
    loadPullRequestsCommand(bot, message, { isAll: false });
  },
});
