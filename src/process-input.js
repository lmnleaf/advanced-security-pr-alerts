function processInput (repos, totalDays, includeRefAlerts, context) {
  let input = {
    owner: context.repo.owner,
    repos: [context.repo.repo],
    totalDays: 30,
    includeRefAlerts: false
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

  if (includeRefAlerts === 'true' || includeRefAlerts === true) {
    input.includeRefAlerts = true;
  } else if (includeRefAlerts != null && includeRefAlerts != 'false' && includeRefAlerts != false) {
    throw new Error('include_ref_alerts must be true or false.');
  }

  return input;
}

export { processInput };
