import fs from "fs";

export interface StorageConfig<Data> {
  path: string;
  initialData?: Data;
}

export class Storage<Data> {
  private data: Data;

  constructor(private readonly config: StorageConfig<Data>) {
    this.load();
  }

  private load() {
    if (!fs.existsSync(this.config.path)) {
      this.update(this.config.initialData);
    }

    const file = fs.readFileSync(this.config.path).toString();

    if (file.trim() === "") {
      this.data = this.config.initialData;
    } else {
      try {
        this.data = JSON.parse(file);
      } catch (error) {
        console.error("Storage Error: ", error);
      }
    }
  }

  private save() {
    fs.writeFileSync(this.config.path, JSON.stringify(this.data));
  }

  update(nextData?: Data) {
    if (nextData) {
      this.data = nextData;
    }

    this.save();
  }

  getData() {
    return this.data;
  }
}
