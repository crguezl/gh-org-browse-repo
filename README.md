## Installation

```
gh extension install crguezl/gh-org-browse-repo
```

## Usage

```
➜  gh-org-browse-repo git:(main) ✗ gh help org-browse-repo
Usage: gh org-browse [options] [options]

Options:
  -V, --version          output the version number
  -S, --search <query>   search <query> using GitHub Search API. A dot '.' refers to all the repos
  -d, --dryrun           shows the repos that will be open
  -r, --regexp <regexp>  filter <query> results using <regexp>
  -o --org <org>         set default organization or user
  -h, --help             display help for command

  - You can set the default organization through the GITHUB_ORG environment variable
  - Additional gh options:
      -b, --branch string            Select another branch by passing in the branch name
      -c, --commit                   Open the last commit
      -n, --no-browser               Print destination URL instead of opening the browser
      -p, --projects                 Open repository projects
      -R, --repo [HOST/]OWNER/REPO   Select another repository using the [HOST/]OWNER/REPO format
      -s, --settings                 Open repository settings
      -w, --wiki                     Open repository wiki
```

## Example

```
➜  gh-org-browse-repo git:(main) ✗ gh org-browse-repo -o ULL-MFP-AET-2122 -S github-readme -r gonzalez -d  -s
gh browse -R ULL-MFP-AET-2122/github-profile-readme-adela-gonzalez-maury-alu0101116204 -s
gh browse -R ULL-MFP-AET-2122/github-profile-readme-ivan-gonzalez-aguiar-alu0100551266 -s
gh browse -R ULL-MFP-AET-2122/github-profile-readme-nestor-gonzalez-lopez-alu0100108859 -s
```