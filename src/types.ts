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
  pullRequest: GitPullRequest; changes: GitCommitChanges
}
