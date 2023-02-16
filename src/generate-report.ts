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
  if (pullRequestDescriptors.length === 0) {
    return "";
  }

  const pullRequestsMarkdown = pullRequestDescriptors
    .map((pullRequestInfo) =>
      generatePullRequestReport(organization, pullRequestInfo)
    )
    .join("\n\n");

  return `
-----------------------
Repository: ${repository.name};

Pull Requests:
${pullRequestsMarkdown}
`.trim();
};

const generatePullRequestReport = (
  organization: string,
  { pullRequest, changes }: PullRequestDescriptor
) => {
  const markdown = `
  Name: ${pullRequest.title};
  Owner: ${pullRequest.createdBy.displayName};
  Changes: ${changes.changes.filter((change) => !change.item.isFolder).length};
  Link: https://dev.azure.com/${organization}/${
    pullRequest.repository.project.name
  }/_git/${pullRequest.repository.name}/pullrequest/${
    pullRequest.pullRequestId
  };
`;

  return "  " + markdown.trim();
};
