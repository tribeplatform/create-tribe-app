// #!/usr/bin/env node
const prompt = require("prompt-sync")({ sigint: true });
const shell = require("shelljs");

const { program } = require("commander");
const packageJson = require("./package.json");
program
  .name("create-tribe-app")
  .description("CLI to generate a sample project using Tribe app starter kit")
  .version(packageJson.version, "--version", "Output the current version")
  .showSuggestionAfterError()
  .showHelpAfterError("(add --help for additional information)")
  .usage("[global options] command")
  .requiredOption("--name <name>", "Name of the app")
  .requiredOption("--dir <directory>", "Directory to create the folder in.")
  .option("-p, --port <port>", "Port number")
  .option("--client-id <clientId>", "Client ID of the app.")
  .option("--client-secret <clientSecret>", "Client Secret of the app.")
  .option("--sign-secret <signSecret>", "Webhook sign secret of the app.")
  .option("-v, --verbose", "Show each steps")
  .parse();

const options = program.opts();

console.log(options);

const fs = require("fs");

const githubURL = "http://github.com/tribeplatform/tribe-starter-app";
function cloneGit(name) {
  if (!shell.which("git")) {
    shell.echo("Sorry, this script requires git");
    shell.exit(1);
  }
  if (shell.exec(`git clone ${githubURL} ${name}`).code !== 0) {
    shell.echo("Error: Git clone failed. Please retry.");
    shell.exit(1);
  }
}

function initGit() {
  shell.rm("-rf", ".git");
  shell.exec("git init");
  shell.exec("git add -A");
  shell.exec(`git commit -m "Initial commit"`);
}

function modifyProject(name) {
  directory = shell.pwd().stdout;
  shell.cp("server/.env.example", "server/.env");
  shell.cp("client/.env.example", "client/.env");
  const pkgJson = require(`${directory}/package.json`);
  pkgJson.name = name;
  fs.writeFileSync(
    `${directory}/package.json`,
    JSON.stringify(pkgJson, null, 2)
  );
}

function main() {
  shell.cd(options.dir);
  console.log(shell.pwd().stdout);
  cloneGit(options.name);

  shell.cd(options.name);

  modifyProject(options.name);

  initGit();
}

if (require.main === module) {
  main();
}
