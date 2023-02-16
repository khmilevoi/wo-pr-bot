import { WebApi } from "azure-devops-node-api";
import * as fs from "fs";
import {
  GitCommitChanges,
  GitPullRequest,
  GitRepository,
} from "azure-devops-node-api/interfaces/GitInterfaces";
import { GitApi, IGitApi } from "azure-devops-node-api/GitApi";

type TestConnectionConfig = {
  api: WebApi;
  configJSONPath: string;
};

type CacheGroup<Data> = {
  [key: string]: Data;
};

type Cache = {
  repositories?: CacheGroup<GitRepository[]>;
  pullRequests?: CacheGroup<GitPullRequest[]>;
  changes?: CacheGroup<GitCommitChanges>;
};

class Connection {
  private cache: Cache = {};

  constructor(private readonly config: TestConnectionConfig) {
    this.readCache();
  }

  private readCache() {
    if (!fs.existsSync(this.config.configJSONPath)) {
      fs.writeFileSync(this.config.configJSONPath, "{}");
    }

    this.cache = JSON.parse(
      fs.readFileSync(this.config.configJSONPath).toString()
    );
  }

  updateCache() {
    fs.writeFileSync(this.config.configJSONPath, JSON.stringify(this.cache));
  }

  private createHandler<Key extends keyof Cache>(
    api: IGitApi,
    methodName: keyof IGitApi,
    cacheKey: Key
  ) {
    return async (...args: any[]) => {
      const key = JSON.stringify(args);

      if (this.cache[cacheKey]?.[key] == null) {
        const method = api[methodName];

        if (typeof method === "function") {
          this.cache[cacheKey] = this.cache[cacheKey] ?? {};

          console.log(`[API CALL]: ${methodName}(${args.join(", ")})`);

          this.cache[cacheKey][key] = await method.bind(api)(...args);

          this.updateCache();
        }
      }

      return this.cache[cacheKey][key] as Cache[Key][keyof Cache[Key]];
    };
  }

  async getGitApi(): Promise<Partial<GitApi>> {
    const realGitApi = await this.config.api.getGitApi();

    return {
      getRepositories: this.createHandler(
        realGitApi,
        "getRepositories",
        "repositories"
      ),
      getPullRequests: this.createHandler(
        realGitApi,
        "getPullRequests",
        "pullRequests"
      ),
      getChanges: this.createHandler(realGitApi, "getChanges", "changes"),
    };
  }
}

interface CachedConnectionMock {
  new (config: TestConnectionConfig): Omit<Connection, keyof WebApi> & WebApi;
}

export const CachedConnection = Connection as unknown as CachedConnectionMock;
