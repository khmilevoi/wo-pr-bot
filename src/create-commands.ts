import TelegramBot, { Message } from "node-telegram-bot-api";

export type Command = {
  command: string;
  description: string;
  callback: (message: Message) => void;
};

export const createCommands = (bot: TelegramBot, commands: Command[]) => {
  bot.setMyCommands(commands);

  bot.on("message", (message) => {
    const command = commands.find(
      (command) => message.text.startsWith(command.command)
    );

    if (command) {
      command.callback(message);
    }
  });
};
