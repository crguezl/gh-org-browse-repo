## Installation

```
gh extension install crguezl/gh-org-browse-repo
```

## Usage

```
Usage: gh org-browse-repo [options]

Open tabs in your browser for all the matching repos inside the org

Options:
  -V, --version          output the version number
  -C, --commit           open the commits page
  -S, --search <query>   search <query> using GitHub Search API. A dot '.' refers to all the repos
  -d, --dryrun           shows the repos that will be open
  -P, --pause <number>   pause <number> of open tabs (default: 20)
  -r, --regexp <regexp>  filter <query> results using <regexp>
  -o --org <org>         set default organization or user
  -h, --help             display help for command

  - You can set the default organization through the GITHUB_ORG environment variable
  - If the org is not specified and you issue the command inside a repo the org of that repo will be used
  - Additional options will be passed to "gh browse":
      -b, --branch string            Select another branch by passing in the branch name
      -c, --commit                   Open the last commit
      -n, --no-browser               Print destination URL instead of opening the browser
      -p, --projects                 Open repository projects
      -s, --settings                 Open repository settings
      -w, --wiki                     Open repository wiki
```

## Example

Search for repos with name that matches `github-readme` and filter those that match `gonzalez` inside the organization
`ULL-MFP-AET-2122`. Show how `gh` cli will be called:

```
✗ gh org-browse-repo -o ULL-MFP-AET-2122 -S github-readme -r gonzalez -d  -s
gh browse -R ULL-MFP-AET-2122/github-profile-readme-adela-gonzalez-maury-alu0101116204 -s
gh browse -R ULL-MFP-AET-2122/github-profile-readme-ivan-gonzalez-aguiar-alu0100551266 -s
gh browse -R ULL-MFP-AET-2122/github-profile-readme-nestor-gonzalez-lopez-alu0100108859 -s
```