import {
  GitCommitChanges,
  GitPullRequest,
  GitRepository,
} from "azure-devops-node-api/interfaces/GitInterfaces";

export type GitDescriptor = {
  repository: GitRepository;
  pullRequestDescriptors: PullRequestDescriptor[];
};

export type PullRequestDescriptor = {
  isMine: boolean;
  isReviewed: boolean;
  isCanBeMerged: boolean;
  pullRequest: GitPullRequest;
  changes: GitCommitChanges;
};
