import { WebApi } from "azure-devops-node-api";
import { PullRequestStatus } from "azure-devops-node-api/interfaces/GitInterfaces";
import { GitDescriptor, PullRequestDescriptor } from "./types";

export type IGetPullRequestsFlags = {
  isAll: boolean;
};

export type IGetPullRequestsConfig = {
  userEmail?: string;
  userToken?: string;
} & IGetPullRequestsFlags;

export const getPullRequests = async (
  connection: WebApi,
  targetRepositories: string[],
  config: IGetPullRequestsConfig
): Promise<GitDescriptor[]> => {
  const gitApi = await connection.getGitApi();
  const repositories = await gitApi.getRepositories();

  const userEmail = getUserEmail(config);

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
          .filter((pullRequest) => {
            const descriptor = {
              isDraft: pullRequest.isDraft,
              isMine:
                pullRequest.createdBy?.uniqueName?.toLowerCase() ===
                userEmail?.toLowerCase(),
              isCanBeMerged:
                (pullRequest.reviewers?.filter(
                  (reviewer) => reviewer.vote === 10
                )?.length ?? 0) >= 2,
              isReviewed: !!pullRequest.reviewers?.find(
                (reviewer) =>
                  reviewer.uniqueName?.toLowerCase() ===
                    userEmail?.toLowerCase() && reviewer.vote === 10
              ),
            };

            return !Object.values(descriptor).includes(true);
          })
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

  return requests.flat().reduce<GitDescriptor[]>((result, item) => {
    if (item) {
      return [
        ...result,
        {
          ...item,
          pullRequestDescriptors: item.pullRequestDescriptors.filter(
            (item): item is PullRequestDescriptor => !!item
          ),
        },
      ];
    }

    return result;
  }, []);
};

const getUserEmail = ({ userEmail, isAll }: IGetPullRequestsConfig) => {
  if (isAll) {
    return null;
  }

  return userEmail ?? null;
};
