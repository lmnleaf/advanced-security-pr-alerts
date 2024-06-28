# advanced-security-pr-alerts

The Advanced Security PR Alerts action generates a CSV that contains a list of code scanning alerts from pull requests.
* This action can be configured to include only alerts surfaced in the PR comments or to include all alerts on th PR branch.
* When the CSV includes all alerts on the branch, any alerts that were surfaced in the PR comments will have the `in_pr_comment` field set to `true`.
* The workflow annotation will include a report summary.

Background Info:
* GitHub Adanced Security users can configure CodeQL code scanning to scan every pull request for vulnerable code.
  * When vulnerabilities are detected, code scanning alerts are surfaced on the PR.
  * Alerts for vulnerabilities that are directly related to the code changes in the PR, are added to a comment on the PR.
  * Alerts for other vulnerabilities, not directly related to the code changes, are available on the PR branch.

<br>

**Configuration Details**
* Required input:
  * `TOKEN` - GITHUB_TOKEN or PAT. A PAT is required to get PR alerts for repos other than the repo where the action is used.
  * `path` - the path where the CSV should be written. Note: to upload the CSV as an artifact, use GitHub's [upload-artifact](https://github.com/actions/upload-artifact) action.
* Optional input:
  * `repos` - a comma separated list of repos from which to get PR alerts. Set it to `all` to get PR alerts from all repos in an organization. Defaults to the current repo.
  * `total_days` - the number of days to look back for PR alerts. Defaults to 30 days.
  * `include_ref_alerts` - set to `true` to include alerts that are not surfaced in the PR comment. Defaults to `false`.

<br>

**Sample CSV Header and Data**
```
number,rule_id,rule_security_severity_level,rule_severity,description,state,repo,in_pr_comment,pr_number,pr_user,pr_state,pr_draft,pr_merged_at,pr_updated_at,most_recent_instance_state,most_recent_instance_ref,most_recent_commit_sha,most_recent_instance_path,tool,tool_version,fixed_at,dismissed_at,dismissed_by,dismissed_reason,dismissed_comment,created_at,updated_at
86,js/code-injection,critical,error,Code injection,open,cool-repo,true,1,cooldev,open,false,,2024-06-28T19:34:19Z,open,refs/pull/1/head,e6e3fc256e0d5711d70ae2c8afb8cdb3fb2dcd2f,routes/showProductReviews.ts,CodeQL,2.17.6,,,,,,2024-06-28T19:34:15Z,2024-06-28T19:34:17Z
53,js/polynomial-redos,high,warning,Polynomial regular expression used on uncontrolled data,open,wow-repo,false,1,cooldev,open,false,,2024-06-28T19:34:19Z,open,refs/pull/1/head,e6e3fc256e0d5711d70ae2c8afb8cdb3fb2dcd2f,routes/imageUploader.ts,CodeQL,2.17.6,,2024-06-29T19:34:17Z,cooluser,won't fix,hoping it's not a big deal,2024-02-28T15:57:36Z,2024-06-29T19:34:17Z
```

<br>

**Sample Workflow Annotation/Report Summary**
```
Total PR alerts found: 151.
All org repos reviewed: false.
Repos reviewed: cool-repo, woot-repo, wow-repo.
```

<br>

**Example Workflow Configuration**
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
