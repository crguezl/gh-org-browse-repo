const ins = require("util").inspect;
// const balanced = require('balanced-match');

const deb = (...args) => {
  console.log(ins(...args, { depth: null }));
};

const open = require('open');
const shell = require('shelljs');
const { Command } = require('commander');
const prompt = require('prompt-sync')();

const { getDefaultOrg } = require("@crguezl/gh-utilities");

const program = new Command();

program.version(require('./package.json').version);

program
  .allowUnknownOption()
  .name("gh org-browse-repo")
  .description('Open tabs in your browser for all the matching repos inside the org')
  .option('-C, --commit', 'open the commit activity pages')
  .option('-S, --search <query>', "search <query> using GitHub Search API. A dot '.' refers to all the repos")
  .option('-d, --dryrun', 'shows the repos that will be open')
  .option('-P, --pause <number>', 'pause <number> of open tabs', 20)
  .option('-r, --regexp <regexp>', 'filter <query> results using <regexp>')
  .option('-v, --dontmatch <regexp>', 'filter <query> results not matching <regexp>')
  .option('-o --org <org>', 'set default organization or user');

program.addHelpText('after', `
  - You can set the default organization through the GITHUB_ORG environment variable
  - If the org is not specified and you issue the command inside a repo the org of that repo will be used 
  - Additional options will be passed to "gh browse":
      -b, --branch string            Select another branch by passing in the branch name
      -c, --commit                   Open the last commit
      -n, --no-browser               Print destination URL instead of opening the browser
      -p, --projects                 Open repository projects
      -s, --settings                 Open repository settings
      -w, --wiki                     Open repository wiki
`);

program.parse(process.argv);

const remainingArgs = program.args.join(" ");


//deb('remainingArgs = '+remainingArgs);

const options = program.opts();
//deb(options);

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
  // deb(`searching for ${search} in ${org}`)
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

let org = options.org || getDefaultOrg() ||  process.env["GITHUB_ORG"];

if (!org) {
  let r = shell.exec(`gh browse -n`, {silent: true});
  if (r.code !== 0 ) {
    r = shell.exec(`gh api user --jq .login`, {silent: true});
    if (r. code !== 0 ) {
      console.error("Please, specify an organization!")
      program.help();
    } else {
      org = r.stdout; // user
    }
  } else {
    org = r.stdout.split('/').slice(-2)[0]; // this repo owner
    //deb(org);
  }
} 

let repos = getRepoListFromAPISearch(options.search || '.', org);

let regexp = /./;
if (options.regexp) {
  regexp = new RegExp(options.regexp, 'i');
}
repos = repos.filter(r => regexp.test(r)) 

let dontmatch = null;
if (options.dontmatch) {
  dontmatch = new RegExp(options.dontmatch, 'i');
  repos = repos.filter(r => !dontmatch.test(r)) 
}

if (repos.length === 0 ) {
  console.error(`No repos matching query "${options.search}" found in org ${org}!`);
  process.exit(0);
}

let commands = [];
repos.forEach(name => {
  let command = `gh browse -R ${org}/${name} ${remainingArgs}`;
  if (options.commit) { // While the gh people fix the commit bug in gh cli ...
    //let url = `https://github.com/${org}/${name}/commits`;
    let url = `https://github.com/${org}/${name}/graphs/commit-activity`
    command = url;
  }
  commands.push(command);
})

if (!options.dryrun) {
  console.error(`${repos.length} repos match the query`);
  console.error(`Tabs in your browser will be open in chunks of ${options.pause}. 
After you review each chunk go back to the terminal and press 'Q' to quit or any other key to continue`)
  if (repos.length > 5) {
    console.error(`It is convenient for you to open a new window in your default browser`);
    let input = prompt("Press 'Q' to quit, <Enter> to continue: ")
    if ((/Q/i).test(input)) process.exit(0);
  }
}

commands.forEach((command,i) => {
  if (options.dryrun) console.log(command)
  else {

    if (options.commit) open(command) 
    else shell.exec(command, {silent: true});

    if ((i+1) % options.pause === 0) {
      let input = prompt("Press 'Q' to quit any other key to continue: ")
      if ((/Q/i).test(input)) process.exit(0);
    }
  }
})
