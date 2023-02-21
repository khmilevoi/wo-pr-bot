import {
  getPullRequests,
  IGetPullRequestsConfig,
  IGetPullRequestsFlags,
} from "../get-pull-requests";
import { createAzureConnection } from "../create-azure-connection";
import { config } from "../config";
import { generateReport } from "../generate-report";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { userStorage } from "../storages";

const generatePullRequestsReport = async (
  pullRequestsConfig: IGetPullRequestsConfig
) => {
  const api = createAzureConnection(pullRequestsConfig.userToken);

  const repositories = await getPullRequests(
    api,
    config.repositories,
    pullRequestsConfig
  );
  return generateReport(config.azureOrg, repositories);
};

export const loadPullRequestsCommand = async (
  bot: TelegramBot,
  message: Message,
  flags: IGetPullRequestsFlags
) => {
  try {
    await bot.sendMessage(message.chat.id, "...Loading");

    const currentUser = userStorage.getUser(message.chat.id);

    const report = await generatePullRequestsReport({
      ...flags,
      userEmail: currentUser?.email,
      userToken: currentUser?.token,
    });

    await bot.sendMessage(message.chat.id, report, {
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error(error);

    if (typeof error === "object" && error && "message" in error) {
      await bot.sendMessage(message.chat.id, `${error?.message}`);
      return;
    }

    await bot.sendMessage(message.chat.id, `${error}` || "error");
  }
};
