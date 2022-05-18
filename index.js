#!/usr/bin/env node

const shell = require("shelljs");

const commander = require("commander");
const semver = require("semver");
const chalk = require("chalk");
const validateProjectName = require("validate-npm-package-name");
const packageJson = require("./package.json");
const util = require("./utils");

const program = new commander.Command(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version, "--version", "Output the current version")
  .showSuggestionAfterError()
  .showHelpAfterError("(add --help for additional information)")
  .usage("[global options] command")
  .requiredOption("--name <name>", "Name of the app")
  .option("--dir <directory>", "Directory to create the folder in.", ".")
  .option("-p, --port <port>", "Port number")
  .option("--client-id <clientId>", "Client ID of the app.")
  .option("--client-secret <clientSecret>", "Client Secret of the app.")
  .option("--sign-secret <signSecret>", "Webhook sign secret of the app.")
  .option("-v, --verbose", "Show each steps")
  .parse(process.argv);

const options = program.opts();

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

function modifyServerEnv(directory) {
  let serverEnvString = fs
    .readFileSync(`${directory}/server/.env.example`)
    .toString();
  if (options.port)
    serverEnvString = serverEnvString.replace(
      "PORT=80",
      `PORT=${options.port}`
    );
  if (options.clientId)
    serverEnvString = serverEnvString.replace(
      "CLIENT_ID=",
      `CLIENT_ID=${options.clientId}`
    );
  if (options.clientSecret) {
    serverEnvString = serverEnvString.replace(
      "CLIENT_SECRET=",
      `CLIENT_SECRET=${options.clientSecret}`
    );
  }
  if (options.signSecret) {
    serverEnvString = serverEnvString.replace(
      "SIGNING_SECRET=",
      `SIGNING_SECRET=${options.signSecret}`
    );
  }
  fs.writeFileSync(`${directory}/server/.env`, serverEnvString);
}
function modifyClientEnv(directory) {
  shell.cp("client/.env.example", "client/.env");
}
function modifyPackageJson(directory, name) {
  const pkgJson = require(`${directory}/package.json`);
  pkgJson.name = name;
  fs.writeFileSync(
    `${directory}/package.json`,
    JSON.stringify(pkgJson, null, 2)
  );
}
function modifyConfigYml(directory, name) {
  const path = `${directory}/.circleci/config.yml`;
  let configYml = fs.readFileSync(path).toString();
  configYml = configYml.replaceAll("app-starter", name);
  fs.writeFileSync(path, configYml);
}
function modifyProject(name) {
  directory = shell.pwd().stdout;
  modifyServerEnv(directory);
  modifyClientEnv(directory);
  modifyPackageJson(directory, name);
  modifyConfigYml(directory, name);
  shell.rm("yarn.lock");
}

async function checkIfLatest() {
  const latest = await util
    .checkForLatestVersion(
      `https://registry.npmjs.org/-/package/${packageJson.name}/dist-tags`
    )
    .catch(() => {
      try {
        return execSync("npm view create-react-app version").toString().trim();
      } catch (e) {
        return null;
      }
    });
  return {
    isLatest: latest && semver.gte(packageJson.version, latest),
    latest,
    current: packageJson.version,
  };
}
function checkAppName(name, log = true) {
  const validationResult = validateProjectName(name);
  if (!validationResult.validForNewPackages) {
    if (log) {
      console.error(
        chalk.red(
          `Cannot create a project named ${chalk.green(
            `"${name}"`
          )} because of npm naming restrictions:\n`
        )
      );
    }
    [
      ...(validationResult.errors || []),
      ...(validationResult.warnings || []),
    ].forEach((error) => {
      console.error(chalk.red(`  * ${error}`));
    });
    if (log) {
      console.error(chalk.red("\nPlease choose a different project name."));
    }
  }
  return validationResult.validForNewPackages;
}

async function main() {
  const { isLatest, latest, current } = await checkIfLatest();
  if (!isLatest) {
    console.log();
    console.error(
      chalk.yellow(
        `You are running \`${packageJson.name}\` ${current}, which is behind the latest release (${latest}).\n\n` +
          `We recommend always using the latest version of ${packageJson.name} if possible.`
      )
    );
    console.log();
  } else {
    const isNameValid = checkAppName(options.name, true);
    if (isNameValid) {
      shell.cd(options.dir);

      cloneGit(options.name);

      shell.cd(options.name);

      modifyProject(options.name);

      initGit();

      console.log("Done.");
    }
  }
  shell.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = main;
