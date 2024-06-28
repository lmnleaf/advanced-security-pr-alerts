async function getNumbers(owner, pr, octokit) {
  let alertNumbers = [];
  let prComments = [];

  try {
    await octokit.paginate(
      octokit.rest.pulls.listReviewComments,
      {
        owner,
        repo: pr.repo,
        pull_number: pr.number,
        per_page: 100
      },
      (response) => {
        prComments.push(...response.data);
      }
    );
  } catch (error) {
    throw error;
  }

  prComments = filterComments(prComments).map((comment) => ({ body: comment.body }));

  prComments.forEach((comment) => {
    let number = extractAlertNumber(comment.body);

    if (number !== null) {
      alertNumbers.push(number);
    }
  });

  return alertNumbers;
}

function filterComments (comments) {
  return comments.filter((comment) => comment.user.login === 'github-advanced-security[bot]');
}

function extractAlertNumber(commentBody) {
  const regex = /\[Show more details\]\(https:\/\/.*?\/(\d+)\)/;
  const matches = commentBody.match(regex);
  return matches ? parseInt(matches[1]) : null;
}

export const commentAlertNumbers = {
  getNumbers: getNumbers
}
