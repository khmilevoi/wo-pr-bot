import * as dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const azureOrg = process.env.AZURE_DEVOPS_ORG;

export const config = {
  azureToken: process.env.AZURE_DEVOPS_EXT_PAT,
  azureOrg: azureOrg,
  azureOriginURL: `https://dev.azure.com/${azureOrg}`,
  telegramBotToken: process.env.BOT_TOKEN,
  isDevelopment: process.env.NODE_ENV === "development",
};
