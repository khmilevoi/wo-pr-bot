import { Storage } from "./storage";

export type User = {
  email: string;
  token?: string;
};

type UserStorageData = {
  [chatId: string]: User;
};

export class UserStorage {
  private storage = new Storage<UserStorageData>({
    path: "./users.json",
    initialData: {},
  });

  updateUser(chatId: number, user: User) {
    const data = this.storage.getData();

    data[chatId] = user;

    this.storage.update();
  }

  removeUser(chatId: number) {
    const data = this.storage.getData();

    delete data[chatId];

    this.storage.update();
  }

  getUser(chatId: number): User | null {
    return this.storage.getData()[chatId] ?? null;
  }
}
