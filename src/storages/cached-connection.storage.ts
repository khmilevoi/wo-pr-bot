import { WebApi } from "azure-devops-node-api";
import {
  GitCommitChanges,
  GitPullRequest,
  GitRepository,
} from "azure-devops-node-api/interfaces/GitInterfaces";
import { GitApi, IGitApi } from "azure-devops-node-api/GitApi";
import { Storage } from "./storage";

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
  private cache: Storage<Cache>;

  constructor(private readonly config: TestConnectionConfig) {
    this.cache = new Storage<Cache>({
      path: config.configJSONPath,
      initialData: {},
    });
  }

  private createHandler<Key extends keyof Cache>(
    api: IGitApi,
    methodName: keyof IGitApi,
    cacheKey: Key
  ) {
    return async (...args: unknown[]) => {
      const cache = this.cache.getData();
      const key = JSON.stringify(args);

      cache[cacheKey] = cache[cacheKey] ?? {};
      const cacheGroup = cache[cacheKey];

      if (cacheGroup?.[key] == null) {
        const method = api[methodName];

        if (typeof method === "function") {
          console.log(`[API CALL]: ${methodName}(${args.join(", ")})`);

          // @ts-ignore
          cacheGroup[key] = await method.bind(api)(...args);

          this.cache.update();
        }
      }

      return cache[cacheKey]?.[key] as Cache[Key][keyof Cache[Key]];
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
  new (config: TestConnectionConfig): WebApi;
}

export const CachedConnectionStorage =
  Connection as unknown as CachedConnectionMock;
