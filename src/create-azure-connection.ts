import * as azureDevOps from "azure-devops-node-api";
import { CachedConnection } from "./cached-connection";
import { config } from "./config";

export const createAzureConnection = (token?: string) => {
  const authHandler = azureDevOps.getPersonalAccessTokenHandler(
    token ?? config.azureToken
  );
  const api = new azureDevOps.WebApi(config.azureOriginURL, authHandler);

  if (config.isDevelopment) {
    return new CachedConnection({
      api,
      configJSONPath: "./cache.json",
    });
  }

  return api;
};
