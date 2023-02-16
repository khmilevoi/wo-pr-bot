import * as azureDevOps from "azure-devops-node-api";
import { CachedConnection } from "./cached-connection";
import { config } from "./config";

export const createAzureConnection = () => {
  const authHandler = azureDevOps.getPersonalAccessTokenHandler(
    config.azureToken
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
