import { WebApi } from "azure-devops-node-api";
import { PullRequestStatus } from "azure-devops-node-api/interfaces/GitInterfaces";
import { GitDescriptor } from "./types";

export const getPullRequests = async (
  connection: WebApi,
  targetRepositories: string[]
): Promise<GitDescriptor[]> => {
  const gitApi = await connection.getGitApi();
  const repositories = await gitApi.getRepositories();

  const allowedRepositories = repositories.filter(
    (repository) =>
      repository.name && targetRepositories.includes(repository.name)
  );

  const requests = await Promise.all(
    allowedRepositories.map(async (repository) => {
      const pullRequests = await gitApi.getPullRequests(repository.id ?? "", {
        status: PullRequestStatus.Active,
      });

      const pullRequestDescriptors = await Promise.all(
        pullRequests
          .filter((pullRequest) => !pullRequest.isDraft)
          .map(async (pullRequest) => {
            if (pullRequest.lastMergeCommit?.commitId && repository.id) {
              const changes = await gitApi.getChanges(
                pullRequest.lastMergeCommit.commitId,
                repository.id
              );

              return {
                changes,
                pullRequest,
              };
            }
          })
      );

      return {
        repository,
        pullRequestDescriptors,
      };
    }, [])
  );

  const flatted = requests.flat().filter((item) => !!item);

  return flatted.map(({ repository, pullRequestDescriptors }) => {
    return {
      repository: repository,
      pullRequestDescriptors: pullRequestDescriptors,
    };
  });
};
