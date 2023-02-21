import TelegramBot from "node-telegram-bot-api";
import { config } from "./config";
import { createCommands } from "./create-commands";
import {
  createCronStartCommand,
  createCronStopCommand,
  createDelTokenCommand,
  createGetAllCommand,
  createGetCommand,
  createLoginCommand,
  createLogoutCommand,
  createSetTokenCommand,
  createWhoAmICommand,
} from "./commands";

const bot = new TelegramBot(config.telegramBotToken, { polling: true });

createCommands(bot, [
  createGetAllCommand(bot),
  createGetCommand(bot),
  createCronStartCommand(bot),
  createCronStopCommand(bot),
  createLoginCommand(bot),
  createLogoutCommand(bot),
  createSetTokenCommand(bot),
  createDelTokenCommand(bot),
  createWhoAmICommand(bot),
]);
