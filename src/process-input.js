function processInput (repos, totalDays, commentAlertsOnly, context) {
  let input = {
    owner: context.repo.owner,
    repos: [context.repo.repo],
    totalDays: 30,
    commentAlertsOnly: true
  }

  if (repos != null && repos.length > 0) {
    input.repos = repos.split(',');
  }

  let days = parseInt(totalDays);
  if (days != NaN && days > 0 && days <= 365) {
    input.totalDays = days;
  } else if (days != NaN && (days <= 0 || days > 365)) {
    throw new Error('total_days must be greater than 0 and less than or equal to 365.');
  }

  if (commentAlertsOnly != null && commentAlertsOnly === 'false' || commentAlertsOnly === false) {
    input.commentAlertsOnly = false;
  } else if (commentAlertsOnly != null && commentAlertsOnly != 'true' && commentAlertsOnly != true) {
    throw new Error('comment_alerts_only must be true or false.');
  }

  return input;
}

export { processInput };
