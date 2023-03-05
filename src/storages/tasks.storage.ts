import { ScheduledTask } from "node-cron";

export class TasksStorage {
  private data: { [key: string]: ScheduledTask } = {};

  addCron(key: string | number, task: ScheduledTask) {
    const prevTask = this.data[key];

    if (prevTask) {
      prevTask.stop();
    }

    this.data[key] = task;

    return !!prevTask;
  }

  stopCron(key: string | number) {
    const task = this.data[key];

    if (task) {
      task.stop();
    }

    return !!task;
  }
}
