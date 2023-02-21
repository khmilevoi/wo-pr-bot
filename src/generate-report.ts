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
Repository: ${createBold(repository.name)};

Pull Requests:
${pullRequestsMarkdown}
`.trim();
};

const generatePullRequestReport = (
  organization: string,
  { pullRequest, changes }: PullRequestDescriptor
) =>
  `
Name: ${createLink(
    pullRequest.title,
    createPullRequestLink(
      organization,
      pullRequest?.repository?.project?.name,
      pullRequest?.repository?.name,
      pullRequest.pullRequestId
    )
  )};
Owner: ${createItalic(pullRequest.createdBy?.displayName)};
Changes: ${changes.changes?.filter((change) => !change.item?.isFolder).length};
`.trim();

const createLink = (title: string = "", link: string = "") => {
  return `<a href="${link}">${title}</a>`;
};

const createItalic = (text?: string) => {
  return `<i>${text}</i>`;
};

const createBold = (text?: string) => {
  return `<b>${text}</b>`;
};

const createPullRequestLink = (
  organization: string,
  project?: string,
  repository?: string,
  pullRequestId?: number
) =>
  `https://dev.azure.com/${organization}/${project}/_git/${repository}/pullrequest/${pullRequestId}`;
