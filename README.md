# advanced-security-pr-alerts

The Advanced Security PR Alerts Action generates a csv that contains a list of code scanning alerts surfaced on pull requests.

Overview:
* GitHub customers that are using GitHub Advanced Security can configure CodeQL code scanning to scan code for vulnerabilities on every pull request.
  * When a vulnerability is detected in the code changes in the PR, an alert for the vulnerability is surfaced in a comment on the PR.
  * Other vulnerabilities may be detected in the PR branch that are not directly related to the code changes in the PR and are not surfaced on a comment in the PR but are available on the PR branch.
* This action generates a CSV that contains a list of code scanning alerts for PR scans.
  * It can be configured to include only alerts surfaced in the comments or to include all alerts on the branch.
  * When the CSV includes all alerts on the branch, any alerts that were surfaced in the PR comments will have the `in_pr_comment` field set to `true`.

Details:
* Required input for the workflow:
  * `TOKEN` - GITHUB_TOKEN or PAT. A PAT is required to get PR alerts for repos other than the repo where the action is used.
  * `path` - the path where the CSV should be written. Note: to upload the CSV as an artifact, use GitHub's [upload-artifact](https://github.com/actions/upload-artifact) action.
* Optional input:
  * `repos` - a comma separated list of repos from which to get PR alerts. Set it to `all` to get PR alerts from all repos in an organization. Defaults to the current repo.
  * `total_days` - the number of days to look back for PR alerts. Defaults to 30 days.
  * `include_ref_alerts` - set to `true` to include alerts that are not surfaced in the PR comment. Defaults to `false`.

A report summary is printed to the workflow run summary's annotations. The summary includes the number of PR alerts found, whether or not PR alerts were pulled for the whole organization, and if not, the list of repos for which PR alerts were pulled.

Sample Output:
```
Total PR alerts found: 151.
All org repos reviewed: false.
Repos reviewed: cool-repo, woot-repo, wow-repo.
```

Sample CSV Header and Data:
```
number,rule_id,rule_security_severity_level,rule_severity,description,state,repo,in_pr_comment,pr_number,pr_user,pr_state,pr_draft,pr_merged_at,pr_updated_at,most_recent_instance_state,most_recent_instance_ref,most_recent_commit_sha,most_recent_instance_path,tool,tool_version,fixed_at,dismissed_at,dismissed_by,dismissed_reason,dismissed_comment,created_at,updated_at
86,js/code-injection,critical,error,Code injection,open,cool-repo,true,1,cooldev,open,false,,2024-06-28T19:34:19Z,open,refs/pull/1/head,e6e3fc256e0d5711d70ae2c8afb8cdb3fb2dcd2f,routes/showProductReviews.ts,CodeQL,2.17.6,,,,,,2024-06-28T19:34:15Z,2024-06-28T19:34:17Z
53,js/polynomial-redos,high,warning,Polynomial regular expression used on uncontrolled data,open,wow-repo,false,1,cooldev,open,false,,2024-06-28T19:34:19Z,open,refs/pull/1/head,e6e3fc256e0d5711d70ae2c8afb8cdb3fb2dcd2f,routes/imageUploader.ts,CodeQL,2.17.6,,2024-06-29T19:34:17Z,cooluser,won't fix,hoping it's not a big deal,2024-02-28T15:57:36Z,2024-06-29T19:34:17Z
```

Workflow setup:

```
name: PR Alerts

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 28-31 * *'

jobs:
  pr_alerts_csv:
    runs-on: ubuntu-latest
    name: PR Alerts CSV
    steps:
      - name: Generate CSV
        uses: lmnleaf/advanced-security-pr-alerts@v1.0.0
        with:
          TOKEN: ${{ secrets.PAT }}
          path: ${{ github.workspace }}
          repos: cool-repo,woot-repo,wow-repo
          total_days: 365
          include_ref_alerts: true
      - name: Upload CSV
        uses: actions/upload-artifact@v4
        with:
          name: pr-alerts-csv
          path: ${{ github.workspace }}/pr-alerts-report.csv
```
