import { GitDescriptor, PullRequestDescriptor } from "./types";

export const generateReport = (
  organization: string,
  repositories: GitDescriptor[]
) => {
  return repositories
    .map((repository) => generateRepositoryReport(organization, repository))
    .join("\n");
};

const generateRepositoryReport = (
  organization: string,
  { repository, pullRequestDescriptors }: GitDescriptor
) => {
  const filteredPullRequests = pullRequestDescriptors.filter(
    (pr) => !pr.isMine && !pr.isReviewed && !pr.isCanBeMerged
  );

  if (filteredPullRequests.length === 0) {
    return "";
  }

  const pullRequestsMarkdown = filteredPullRequests
    .map((pullRequestInfo) =>
      generatePullRequestReport(organization, pullRequestInfo)
    )
    .join("\n\n");

  return `
-----------------------
Repository: *${repository.name}*;

Pull Requests:
${pullRequestsMarkdown}
`.trim();
};

const generatePullRequestReport = (
  organization: string,
  { pullRequest, changes }: PullRequestDescriptor
) =>
  `
Name: [${pullRequest.title}](${createPullRequestLink(
    organization,
    pullRequest.repository.project.name,
    pullRequest.repository.name,
    pullRequest.pullRequestId
  )});
Owner: _${pullRequest.createdBy.displayName}_;
Changes: ${changes.changes.filter((change) => !change.item.isFolder).length};
`.trim();

const createPullRequestLink = (
  organization: string,
  project: string,
  repository: string,
  pullRequestId: number
) =>
  `https://dev.azure.com/${organization}/${project}/_git/${repository}/pullrequest/${pullRequestId}`;
