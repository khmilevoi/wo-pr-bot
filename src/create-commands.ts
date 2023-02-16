import * as TelegramBot from "node-telegram-bot-api";
import { Message } from "node-telegram-bot-api";

export type Command = {
  command: string;
  description: string;
  callback: (message: Message) => void;
};

export const createCommands = (bot: TelegramBot, commands: Command[]) => {
  bot.setMyCommands(commands);

  bot.on("message", (message) => {
    const command = commands.find(
      (command) => command.command === message.text
    );

    if (command) {
      command.callback(message);
    }
  });
};
