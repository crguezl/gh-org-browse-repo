const ins = require("util").inspect;
// const balanced = require('balanced-match');

const deb = (...args) => {
  console.log(ins(...args, { depth: null }));
};

const shell = require('shelljs');
const { Command } = require('commander');

const program = new Command();
program.version(require('./package.json').version);

program
  .allowUnknownOption()
  .name("gh org-browse [options]")
  .option('-S, --search <query>', "search <query> using GitHub Search API. A dot '.' refers to all the repos")
  .option('-j, --json', 'returns the full json object')
  .option('-r, --regexp <regexp>', 'filter <query> results using <regexp>')
  .option('-o --org <org>', 'default organization or user');

program.addHelpText('after', `
  - You can set the default organization through the GITHUB_ORG environment variable
  - Additional gh options:
      -b, --branch string            Select another branch by passing in the branch name
      -c, --commit                   Open the last commit
      -n, --no-browser               Print destination URL instead of opening the browser
      -p, --projects                 Open repository projects
      -R, --repo [HOST/]OWNER/REPO   Select another repository using the [HOST/]OWNER/REPO format
      -s, --settings                 Open repository settings
      -w, --wiki                     Open repository wiki
`);

program.parse(process.argv);

const remainingArgs = program.args.join(" ");


deb(remainingArgs);

const options = program.opts();
deb(options);

if (!shell.which('git')) {
  showError('Sorry, this extension requires git installed!');
}
if (!shell.which('gh')) {
  showError('Sorry, this extension requires GitHub Cli (gh) installed!');
}

function showError(error) {
  if (error) {
    console.error(`Error!: ${error}`);
    process.exit(1);
  }
}

function sh(executable, ...args) {
  let command = `${executable} ${args.join('')}`;
  let result = shell.exec(command, { silent: true });
  if (result.code !== 0) {
    shell.echo(`Error: Command "${command}" failed\n${result.stderr}`);
    shell.exit(result.code);
  }
  return result.stdout.replace(/\s+$/, '');
}

function shContinue(executable, arg, cb) {
  let command = `${executable} ${arg}`;
  let result = shell.exec(command, { silent: true }, cb);
  return result;
}

const gh = (...args) => sh("gh", ...args);
const ghCont = (arg,cb) => shContinue("gh", arg, cb);


function getRepoListFromAPISearch(search, org) {
  deb(`searching for ${search} in ${org}`)
  let query;
  const allRepos = (org) => `
  query($endCursor: String) {
    organization(login: "${org}") {
      repositories(first: 100, after: $endCursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node  {
            name
          }
        }
      }
    }
  }
  `
  const searchForRepos = (search, org) => `
  query($endCursor: String) {
    search(type: REPOSITORY, query: "org:${org} ${search} in:name", first: 100, after: $endCursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ... on Repository {
            name
          }
        }
      }
    }
  }
  `
   
  function executeQuery(query) {
    let command = `gh api graphql --paginate -f query='${query}'`;
    //console.log(command);
  
    let queryResult = shell.exec(command, { silent: true });
    if (queryResult.code !== 0 || queryResult.length === 0) {
      console.error(`No repos found in org "${org}" matching query "${search}"`)
      process.exit(1);
    }
    return JSON.parse(queryResult).data;  
  }

  //console.log('getRepoListFromAPISearch '+search+" "+org)
  if (!org) {
    console.error("Aborting. Specify a GitHub organization");
    process.exit(1);
  }

  try {
    if (search === ".") {
      let queryResult = executeQuery(allRepos(org));
      let result = queryResult.organization.repositories.edges.map(r => r.node.name);
      
      return result;

    } else {
      let queryResult = executeQuery(searchForRepos(search, org));
      let result = queryResult.search.edges.map(r => r.node.name);

      //console.log(result)
      return result;

    }

  } catch (error) {
    console.error(`${error}: No repos found in org "${org}" matching query "${search}"`)
  }

}


debugger;

let org = options.org || process.env["GITHUB_ORG"];

if (!org) program.help();

let repos = getRepoListFromAPISearch(options.search, org);


deb(repos)

let regexp = /./;
if (options.regexp) {
  regexp = new RegExp(options.regexp, 'i');
}
repos = repos.filter(r => regexp.test(r)) 

deb(repos)

repos.forEach(name => {

  let command = `gh browse -R ${org}/${name} ${remainingArgs}`
  deb(command);
  shell.exec(`gh browse -R ${org}/${name} ${program.args}`)
})
