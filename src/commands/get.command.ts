import { ICommand } from "../create-commands";
import { IGetPullRequestsFlags } from "../get-pull-requests";
import { loadPullRequestsCommand } from "./load-pull-requests.command";
import TelegramBot from "node-telegram-bot-api";

export const createGetCommand = (bot: TelegramBot): ICommand => ({
  command: "/get",
  description: "Command to retrieve pull requests with an optional --all flag.",
  callback: async (message) => {
    const flags = message.text?.replace("/get", "").trim().split(/\s+/) ?? [];

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

    loadPullRequestsCommand(bot, message, config);
  },
});
