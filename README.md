## Installation

```
gh extension install crguezl/gh-org-browse-repo
```

## Usage

```
Usage: gh org-browse-repo [options]

Open tabs in your browser for all the matching repos inside the org

Options:
  -V, --version             output the version number
  -C, --commit              open the insight commits activity pages
  -u, --pulse               open the insight pulse pages
  -S, --search <query>      search <query> using GitHub Search API. A dot '.' refers to all the repos
  -d, --dryrun              shows the repos that will be open
  -P, --pause <number>      pause <number> of open tabs (default: 20)
  -f, --file <file>         read the list of students/members from <file>
  -r, --regexp <regexp>     filter <query> results using <regexp>
  -v, --dontmatch <regexp>  filter <query> results not matching <regexp>
  -o --org <org>            set default organization or user
  -h, --help                display help for command

  - You can set the default organization through the GITHUB_ORG environment variable
  - If the org is not specified and you issue the command inside a repo the org of that repo will be used 
  - The following additional options will be passed to "gh browse":
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

## Example with students file

Pulse pages for the lab "scope-intro" for the students take from file `~/campus-virtual/2223/pl2223/PE101.txt`.
Dry run:

```
✗ gh org-browse-repo -u -S scope-intro -f ~/campus-virtual/2223/pl2223/PE101.txt -d
No repos found for student daniel-clavijo-gonzalez-alu0101336817!
No repos found for student edgar_joel-martin-melian-alu0101434698!
https://github.com/ULL-ESIT-PL-2223/scope-intro-marcos-barrios-lorenzo-alu0101056944/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-muhammad-campos-preira-alu0101434025/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-adriano-dos_santos-alu0101436784/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-adrian-fleitas-de_la_rosa-alu0101024363/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-kilian-gonzalez-rodriguez-alu0101222325/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-antonio_felipe-hernandez-alu0101338460/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-jose-lozano-armas-alu0101392561/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-daniel-mendez-rodriguez-alu0101391793/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-diego-perez-garcia-alu0101345918/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-gabriel-perez-gonzalez-alu0101233499/pulse
https://github.com/ULL-ESIT-PL-2223/scope-intro-gabriel_jonay-vera-alu0101398198/pulse
```

## Default org

I use a couple of alias `cd` and `pwd` to set and get the current organization:

```
➜  gh-org-browse-repo git:(main) ✗ gh alias list | grep cd
cd:	!gh config set current-org "$1" 2>/dev/null
➜  gh-org-browse-repo git:(main) ✗ gh alias list | grep pwd
pwd:	!gh config get current-org
➜  gh-org-browse-repo git:(main) ✗ gh cd ULL-MFP-AET-2122
➜  gh-org-browse-repo git:(main) ✗ gh pwd
ULL-MFP-AET-2122
```

Now you can omit the org argument:

```
➜  gh-org-browse-repo git:(main) ✗ gh org-browse-repo -S github-readme -r gonzalez -d  -s
gh browse -R ULL-MFP-AET-2122/github-profile-readme-ivan-gonzalez-aguiar-alu0100551266 -s
gh browse -R ULL-MFP-AET-2122/github-profile-readme-adela-gonzalez-maury-alu0101116204 -s
gh browse -R ULL-MFP-AET-2122/github-profile-readme-nestor-gonzalez-lopez-alu0100108859 -s
```