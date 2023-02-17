import * as azureDevOps from "azure-devops-node-api";
import { CachedConnectionStorage } from "./storages";
import { config } from "./config";

export const createAzureConnection = (token?: string) => {
  const authHandler = azureDevOps.getPersonalAccessTokenHandler(
    token ?? config.azureToken
  );
  const api = new azureDevOps.WebApi(config.azureOriginURL, authHandler);

  if (config.isDevelopment) {
    return new CachedConnectionStorage({
      api,
      configJSONPath: "./cache.json",
    });
  }

  return api;
};
