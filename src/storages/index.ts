import { UserStorage } from "./user.storage";
import { TasksStorage } from "./tasks.storage";

export const userStorage = new UserStorage();

export const taskStorage = new TasksStorage();

export * from "./cached-connection.storage";
